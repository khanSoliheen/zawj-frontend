// app/register/step4.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Block, Button, Image, Input, SelectInput, Text } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useData } from '@/hooks';
import { useRegistrationStore } from '@/store/registration';

const schema = z.object({
  religion: z.enum(['Islam', 'Other'], { error: 'Please select your religion' }),
  wali_name: z.string().optional(),
  wali_relation: z.string().optional(),
  wali_contact: z.string().optional(),
  prayer_regularity: z.enum(['5x daily', 'Regularly', 'Sometimes', 'Rarely', 'Never'], { error: 'Please select 5x daily, regularly, sometimes, rarely, never' }),
  quran_level: z.string().min(4, 'Please enter your Qur\'an level'),
  hijab_or_beard: z.enum(['Yes', 'No', 'Sometimes'], { error: 'Please select Yes, No, Sometimes, Rarely, Never' }),
});

type FormValues = z.infer<typeof schema>;

export default function Step4() {
  const router = useRouter();
  const { setData, data } = useRegistrationStore();
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

  const onSubmit = (values: FormValues) => {
    setData(values);
    router.push(ROUTES.REGISTER_STEP_5);
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
          <Text h4 marginLeft={sizes.s}>Step 4: Islamic Identity</Text>
        </Block>

        {/* Religion */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="religion"
            render={({ field, fieldState }) => (
              <SelectInput
                label="Religion"
                options={['Islam', 'Other']}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </Block>

        {/* Prayer Regularity */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="prayer_regularity"
            render={({ field, fieldState }) => (
              <SelectInput
                label="Prayer Regularity"
                options={['5x daily', 'Regularly', 'Sometimes', 'Rarely', 'Never']}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </Block>

        {/* Quran Level */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="quran_level"
            render={({ field, fieldState }) => (
              <Input
                id="quranLevel"
                label="Qur'an Level"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.quran_level && !errors.quran_level}
                placeholder="Fluent / Learning / Basic"
                marginBottom={12}
              />
            )}
          />
        </Block>

        {/* Wali Name */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="wali_name"
            render={({ field, fieldState }) => (
              <Input
                id="waliName"
                label="Wali Name (if female)"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.wali_name && !errors.wali_name}
                placeholder="Enter wali name"
                marginBottom={12}
              />
            )}
          />
        </Block>

        {/* Wali Relation */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="wali_relation"
            render={({ field, fieldState }) => (
              <Input
                id="waliRelation"
                label="Wali Relation"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.wali_relation && !errors.wali_relation}
                placeholder="e.g. Father / Brother"
                marginBottom={12}
              />
            )}
          />
        </Block>

        {/* Wali Contact */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="wali_contact"
            render={({ field, fieldState }) => (
              <Input
                id="waliContact"
                label="Wali Contact"
                keyboardType="phone-pad"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.wali_contact && !errors.wali_contact}
                placeholder="+91 9876543210"
                marginBottom={12}
              />
            )}
          />
        </Block>

        {/* Hijab or Beard */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="hijab_or_beard"
            render={({ field, fieldState }) => (
              <SelectInput
                label="Hijab (for women) / Beard (for men)"
                options={['Yes', 'No', 'Sometimes']}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
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
