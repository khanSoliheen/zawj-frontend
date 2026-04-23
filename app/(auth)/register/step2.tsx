// app/register/step2.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Block, Button, Image, Input, Text } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useData } from '@/hooks';
import { useRegistrationStore } from '@/store/registration';

const schema = z.object({
  education: z.string().min(4, 'Enter a valid nationality'),
  employment_type: z.string().min(4, 'Enter a valid employment type'),
  designation: z.string().min(4, 'Enter a valid designation'),
  department: z.string().min(4, 'Enter a valid department'),
});

type FormValues = z.infer<typeof schema>;

export default function Step2() {
  const { setData, data } = useRegistrationStore();
  const { theme } = useData();
  const { colors, sizes, gradients, assets } = theme;

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const onSubmit = (values: FormValues) => {
    setData(values);
    router.push(ROUTES.REGISTER_STEP_3);
  };

  return (
    <Block safe keyboard color={colors.background} >
      <Block scroll paddingHorizontal={sizes.s} showsVerticalScrollIndicator={false}>
        <Block row flex={0} align="center" justify="flex-start" marginBottom={sizes.md}>
          {/* Back button */}
          <Button
            onPress={() => router.back()}
            row
            flex={0}
            align="center"
            justify="center"
          >
            <Image
              radius={0}
              width={10}
              height={18}
              color={colors.text}
              source={assets.arrow}
              transform={[{ rotate: '180deg' }]}
            />
          </Button>

          {/* Step Title */}
          <Text h4 marginLeft={sizes.s}> Step 2: Career</Text>
        </Block>

        {/* Education */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="education"
            render={({ field, fieldState }) => (
              <Input
                id="education"
                label="Education"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.education && !errors.education}
                placeholder="Enter your education"
                marginBottom={12}
              />
            )}
          />

          <Controller
            control={control}
            name="employment_type"
            render={({ field, fieldState }) => (
              <Input
                id="employment_type"
                label="Employment Type"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.employment_type && !errors.employment_type}
                placeholder="Private Government..."
                marginBottom={12}
              />
            )}
          />

          <Controller
            control={control}
            name="department"
            render={({ field, fieldState }) => (
              <Input
                id="department"
                label="Department"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.department && !errors.department}
                placeholder="Engineering Sales..."
                marginBottom={12}
              />
            )}
          />
          <Controller
            control={control}
            name="designation"
            render={({ field, fieldState }) => (
              <Input
                id="designation"
                label="Designation"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.designation && !errors.designation}
                placeholder="Software Engineer Network Engineer..."
                marginBottom={12}
              />
            )}
          />
        </Block>

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
