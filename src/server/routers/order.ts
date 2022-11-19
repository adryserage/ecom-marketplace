import { router, protectedProcedure } from '../trpc';
import { randomUUID } from 'crypto';
import { getBuyerId, getCartId } from '@/server/functions/identity';
import { getSelectedOrderItems, getCartItemsPrice } from '@/server/functions/cart';
import { z } from 'zod';
import { stripe } from '@/utils/stripe';

export const orderRouter = router({
  placeOrder: protectedProcedure
    .input(z.object({ addressId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      let cartId = await getCartId(ctx);
      if (!cartId) return null;

      let buyerId = await getBuyerId(ctx);
      if (!buyerId) return null;

      let items = await getSelectedOrderItems(ctx);
      if (!items) return null;

      let lineItems = items.map((e) => e.items).flat();

      let refId = randomUUID();

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems.map((item) => {
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.title,
                images: [
                  `https://res.cloudinary.com/dv9wpbflv/image/upload/w_300,f_auto,q_auto/v${item.image}.jpg`
                ]
              },
              unit_amount: item.priceInCents
            },
            quantity: item.itemCount
          };
        }) as [],

        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}payment/${refId}`,
        cancel_url: `${process.env.NEXTAUTH_URL}payment/${refId}`
      });

      let payment = await ctx.prisma.payment.create({
        data: {
          id: session.id,
          refId: refId
        }
      });

      for await (const bag of items) {
        const bagPrice: number = bag.items.reduce((price: number, bag) => {
          let currentItemPrice: number = bag.itemCount * +bag.priceInCents * 100;
          return price + currentItemPrice;
        }, 0);

        await ctx.prisma.order.create({
          data: {
            addressId: input.addressId,
            totalPriceInCents: bagPrice?.toString(),
            buyerId: buyerId,
            Bag: {
              connect: bag.items.map((item) => {
                return { id: item.id };
              })
            },
            sellerId: bag.sellerId,
            paymentId: payment.id
          }
        });

        await ctx.prisma.bag.updateMany({
          where: {
            cartId: cartId,
            checkedOut: false,
            selected: true
          },
          data: {
            checkedOut: true,
            selected: false
          }
        });
      }

      return session.url;
    }),

  verify: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      let payment = await ctx.prisma.payment.findFirst({
        where: {
          refId: input.id
        }
      });

      if (!payment) return null;

      const paymentSession = await stripe.checkout.sessions.retrieve(payment.id);
      if (!paymentSession) return null;

      if (paymentSession.status === 'open') {
        return { status: paymentSession.status, link: paymentSession.url };
      }

      if (payment.status === 'PENDING' && paymentSession.status === 'complete') {
        await ctx.prisma.payment.update({
          where: {
            id: payment.id
          },
          data: {
            status: 'SUCCESS'
          }
        });

        let items = await ctx.prisma.order.findMany({
          where: {
            paymentId: payment.id
          },
          select: {
            Bag: {
              select: {
                itemCount: true,
                productId: true
              }
            }
          }
        });

        let bags = items
          .map((e) => {
            return [...e.Bag];
          })
          .flat();

        for await (const product of bags) {
          await ctx.prisma.product.update({
            where: {
              id: product.productId
            },
            data: {
              stock: {
                decrement: product.itemCount
              }
            }
          });
        }

        return { status: paymentSession.status };
      }

      return { status: paymentSession.status };
    }),
  getBuyerOrders: protectedProcedure.query(async ({ ctx }) => {
    let id = await getBuyerId(ctx);
    if (!id) return null;

    let buyerOrders = await ctx.prisma.order.findMany({
      where: {
        buyerId: id
      }
    });

    return buyerOrders;
  })
});
