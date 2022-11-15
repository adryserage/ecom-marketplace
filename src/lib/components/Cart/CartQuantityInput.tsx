import { useRef, useState } from 'react';
import {
  createStyles,
  NumberInput,
  NumberInputHandlers,
  ActionIcon,
  LoadingOverlay
} from '@mantine/core';
import { IconPlus, IconMinus } from '@tabler/icons';
import { trpc } from '@/utils/trpc';

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `6px ${theme.spacing.xs}px`,
    borderRadius: theme.radius.sm,
    border: `1px solid ${theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3]}`,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,
    height: 50,
    maxWidth: 200,
    '&:focus-within': {
      borderColor: theme.colors[theme.primaryColor][6]
    }
  },

  control: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    border: `1px solid ${theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3]}`,

    '&:disabled': {
      borderColor: theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3],
      opacity: 0.8,
      backgroundColor: 'transparent'
    }
  },

  input: {
    textAlign: 'center',
    paddingRight: `${theme.spacing.sm}px !important`,
    paddingLeft: `${theme.spacing.sm}px !important`,
    height: 28,
    flex: 1
  }
}));

interface CartQuantityInputProps {
  id: number;
  selectedRow: boolean;
  value: number | undefined;
  min?: number;
  max?: number;
}

export function CartQuantityInput({
  id,
  selectedRow,
  value,
  min = 1,
  max = 10
}: CartQuantityInputProps) {
  const current = trpc.useContext();
  const { classes } = useStyles();
  const handlers = useRef<NumberInputHandlers>(null);
  const incrementItem = trpc.cart.incrementItemCount.useMutation();
  const decrementItem = trpc.cart.decrementItemCount.useMutation();
  const updateItemCount = trpc.cart.updateItemCount.useMutation();

  const handleIncrement = async () => {
    incrementItem.mutate({ id }, { onSuccess: invalidateData });
  };

  const handleDecrement = async () => {
    decrementItem.mutate({ id }, { onSuccess: invalidateData });
  };

  const handleItemCount = async (value: number) => {
    if (value) {
      updateItemCount.mutate({ id, quantity: value }, { onSuccess: invalidateData });
    }
  };

  const invalidateData = () => {
    if (selectedRow) {
      current.cart.getCartItemsPrice.invalidate();
    }
    current.cart.getCartItems.invalidate();
  };

  return (
    <div className={classes.wrapper}>
      <LoadingOverlay visible={incrementItem.isLoading} overlayBlur={2} />
      <ActionIcon<'button'>
        size={28}
        variant="transparent"
        onClick={handleDecrement}
        disabled={value === min || incrementItem.isLoading}
        className={classes.control}
        onMouseDown={(event) => event.preventDefault()}
        radius="sm"
      >
        <IconMinus size={16} stroke={1.5} />
      </ActionIcon>

      <NumberInput
        variant="unstyled"
        min={min}
        max={max}
        handlersRef={handlers}
        value={value}
        onChange={handleItemCount}
        classNames={{ input: classes.input }}
      />

      <ActionIcon<'button'>
        size={28}
        variant="transparent"
        onClick={handleIncrement}
        disabled={value === max}
        className={classes.control}
        onMouseDown={(event) => event.preventDefault()}
        radius="sm"
      >
        <IconPlus size={16} stroke={1.5} />
      </ActionIcon>
    </div>
  );
}
