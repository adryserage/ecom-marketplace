import { Button, Spoiler, AspectRatio, Text, Skeleton } from '@mantine/core';
import Image from 'next/image';
import { QuantityInput } from '@/lib/components/Products/QuantityInput';
import { IconShoppingCart } from '@tabler/icons';
import { useState } from 'react';

type ProductProps = {
  id: string;
  title: string;
  image: string;
  description: string;
  category: string;
  price: string;
};

const Product = ({ id, title, image, description, category, price }: ProductProps) => {
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <>
      <div className="lg:p-6 lg:pt-1 flex justify-center w-full min-h-[640px]">
        <div className="flex flex-col justify-center lg:flex-row bg-white h-full gap-6 max-w-[1400px]">
          <div className="w-full md:w-3/5 lg:w-[525px] h-full mx-auto">
            <AspectRatio ratio={337 / 393} sx={{ maxWidth: '100%', minHeight: '100%' }}>
              <Skeleton visible={loading} radius={0}>
                <Image
                  fill={true}
                  src={`https://res.cloudinary.com/dv9wpbflv/image/upload/v${image}.jpg`}
                  alt="Product Image"
                  onLoad={() => setLoading(false)}
                />
              </Skeleton>
            </AspectRatio>
          </div>

          <div className="p-2 flex flex-1 flex-col justify-between">
            <div className="p-5">
              <Text transform="uppercase" color="dimmed" weight={700} size="xs">
                {category}
              </Text>
              <Text className="text-3xl" mt="xs" mb="md">
                {title}
              </Text>
            </div>

            <div className="p-5">
              <Text className="text-xl text-brown-500" mt="xs" mb="md" weight={300}>
                <Spoiler maxHeight={90} showLabel="Read More" hideLabel="Hide">
                  {description}. We work with monitoring programs to guarantee compliance with the
                  health, safety, and quality standards for our products. The Green to Wear 2.0
                  standard aims to minimize the environmental impact of textile manufacturing. To do
                  this, we have developed Inditex’s The List program which helps us guarantee both
                  the purity of production processes and the health and safety of our garments.
                </Spoiler>
              </Text>
            </div>

            <div className="p-5 flex">
              <Text className="text-4xl" mt="xs" mb="md">
                $ {price}
              </Text>
            </div>

            <div className=" gap-3 p-5 items-center justify-between hidden lg:flex">
              <QuantityInput />
              <Button fullWidth className="h-[50px] max-w-[20rem] text-xl font-light" radius="sm">
                Add To Cart
              </Button>
            </div>

            <div className="fixed flex gap-3 p-5 w-full items-center justify-between lg:hidden bg-white shadow bottom-0 left-0 right-0">
              <Text className="text-4xl">${price}</Text>
              <QuantityInput />
              <Button
                leftIcon={<IconShoppingCart stroke={1.2} />}
                fullWidth
                className="h-[50px] max-w-[20rem] text-lg font-light"
                radius="sm"
              >
                Add To Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Product;
