// app/register/step3.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Block, Button, Image, Input, SelectInput, Text } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useData } from '@/hooks';
import { useRegistrationStore } from '@/store/registration';

const schema = z.object({
  marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed'], { error: 'Please select a marital status' }),
  children_count: z.string().regex(/^\d+$/, 'Enter a valid number').optional(),
  children_details: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Step3() {
  const router = useRouter();
  const { data, setData } = useRegistrationStore();
  const { theme } = useData();
  const { colors, sizes, gradients, assets } = theme;

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const maritalStatus = useWatch({ control, name: 'marital_status' });

  const onSubmit = (values: FormValues) => {
    setData(values);
    router.push(ROUTES.REGISTER_STEP_4);
  };

  return (
    <Block safe keyboard color={colors.background} >
      <Block scroll paddingHorizontal={sizes.s} showsVerticalScrollIndicator={false}>
        {/* Back + Title */}
        <Block row flex={0} align="center" justify="flex-start" marginBottom={sizes.md}>
          <Button onPress={() => router.back()} row flex={0} align="center" justify="center">
            <Image
              radius={0}
              width={10}
              height={18}
              color={colors.text}
              source={assets.arrow}
              transform={[{ rotate: '180deg' }]}
            />
          </Button>
          <Text h4 marginLeft={sizes.s}>Step 3: Marital Info</Text>
        </Block>

        {/* Marital Status */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="marital_status"
            render={({ field, fieldState }) => (
              <SelectInput
                label="Marital Status"
                options={['Single', 'Married', 'Divorced', 'Widowed']}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </Block>

        {/* Conditional Children Info */}
        {(maritalStatus === 'Divorced' || maritalStatus === 'Widowed' || maritalStatus === 'Married') && (
          <>
            <Block flex={0} style={{ zIndex: 0 }} >
              <Controller
                control={control}
                name="children_count"
                render={({ field, fieldState }) => (
                  <Input
                    id="childrenCount"
                    label="Number of Children"
                    keyboardType="numeric"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    error={fieldState.error?.message}
                    success={dirtyFields.children_count && !errors.children_count}
                    placeholder="e.g. 2"
                    marginBottom={12}
                  />
                )}
              />
            </Block>

            <Block flex={0} style={{ zIndex: 0 }} >
              <Controller
                control={control}
                name="children_details"
                render={({ field, fieldState }) => (
                  <Input
                    id="childrenDetails"
                    label="Children Details (ages, gender, custody)"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    error={fieldState.error?.message}
                    success={dirtyFields.children_details && !errors.children_details}
                    placeholder="e.g. 1 son (5), 1 daughter (3)"
                    marginBottom={12}
                  />
                )}
              />
            </Block>
          </>
        )}

        {/* Next Button */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Button onPress={handleSubmit(onSubmit)} gradient={gradients.primary}>
            <Text white>Next</Text>
          </Button>
        </Block>
      </Block>
    </Block>
  );
}
