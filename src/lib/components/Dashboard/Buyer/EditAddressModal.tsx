import { Modal, Button, Input, Grid, Checkbox, LoadingOverlay } from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Address, addressInput } from '@/server/schema';
import { trpc } from '@/utils/trpc';

type EditableAddressModalProps = {
  opened: boolean;
  setOpened: (state: boolean) => void;
  addressId: string;
  data: Address;
};

function EditAddressModal({ opened, setOpened, data }: EditableAddressModalProps) {
  const updateBuyerAddress = trpc.address.create.useMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<Address>({
    defaultValues: {
      ...data
    },
    resolver: zodResolver(addressInput)
  });

  const addressUpdate = async (address: Address) => {
    updateBuyerAddress.mutate(address, { onSuccess: () => setOpened(false) });
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Update Address"
      closeOnEscape={!updateBuyerAddress.isLoading}
      closeOnClickOutside={!updateBuyerAddress.isLoading}
    >
      <LoadingOverlay visible={updateBuyerAddress.isLoading} radius="lg" />
      <form onSubmit={handleSubmit(addressUpdate)}>
        <Input.Wrapper label="Shipping Address" required error={errors.addressLine1?.message}>
          <Input placeholder="934 Hogwart 21st" {...register('addressLine1')} />
        </Input.Wrapper>

        <Grid>
          <Grid.Col span={6}>
            {' '}
            <Input.Wrapper label="City" required mt={15} error={errors.city?.message}>
              <Input placeholder="City" {...register('city')} />
            </Input.Wrapper>
          </Grid.Col>
          <Grid.Col span={6}>
            {' '}
            <Input.Wrapper label="Postal Code" required mt={15} error={errors.postalCode?.message}>
              <Input placeholder="Postal Code" {...register('postalCode')} />
            </Input.Wrapper>
          </Grid.Col>
        </Grid>

        <Input.Wrapper label="Region/State" required mt={15} error={errors.region?.message}>
          <Input placeholder="Region/State" {...register('region')} />
        </Input.Wrapper>

        <Input.Wrapper label="Country" required mt={15} error={errors.country?.message}>
          <Input placeholder="Country" {...register('country')} />
        </Input.Wrapper>

        <Controller
          name="isDefault"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Checkbox
              checked={field.value}
              onChange={field.onChange}
              label="Set as default address"
              mt={15}
            />
          )}
        />

        <Button type="submit" mt="md" radius="md">
          Update Address
        </Button>
      </form>
    </Modal>
  );
}

export default EditAddressModal;
