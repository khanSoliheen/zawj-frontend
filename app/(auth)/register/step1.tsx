// app/register/step1.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform } from 'react-native';
import { z } from 'zod';

import { Block, Button, Image, Input, SelectInput, Text, DatePicker } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useData } from '@/hooks';
import { useRegistrationStore } from '@/store/registration';
const isAndroid = Platform.OS === 'android';

const schema = z.object({
  first_name: z.string().min(4, 'Enter your first name'),
  last_name: z.string().min(1, 'Enter your last name'),
  gender: z.enum(['Male', 'Female'], { error: 'Please select your gender' }),
  dob: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use format YYYY-MM-DD')
    .refine((s) => {
      // Parse safely
      const [y, m, d] = s.split('-').map(Number);
      const dob = new Date(y, m - 1, d);
      if (Number.isNaN(dob.getTime())) return false;

      const today = new Date();

      // Cutoffs
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      const hundredYearsAgo = new Date(
        today.getFullYear() - 100,
        today.getMonth(),
        today.getDate()
      );

      // Must be between 100 years ago and 18 years ago (inclusive on 18)
      return dob <= eighteenYearsAgo && dob >= hundredYearsAgo;
    }, { message: 'You must be at least 18 years old (and not older than 100).' }),
  country: z.string().min(4, 'Enter a valid country'),
  state: z.string().min(4, 'Enter a valid state'),
  city: z.string().min(4, 'Enter a valid city'),
  visibility: z.enum(['Public', 'Private', 'Matched Only'], { error: 'Please select visibility' }),
  email: z.email('Enter valid email'),
  password: z.string().min(6, 'Min 6 characters'),
  confirm_password: z.string().min(6, 'Min 6 characters'),
}).superRefine(({ password, confirm_password }, ctx) => {
  if (password !== confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passwords do not match',
      path: ['confirm_password'],
    });
  }
});

type FormValues = z.infer<typeof schema>;

export default function Step1() {
  const { theme } = useData();
  const { colors, gradients, sizes, assets } = theme;
  const router = useRouter();
  const { setData, data } = useRegistrationStore();

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: data,
  });

  const onSubmit = (values: FormValues) => {
    const { confirm_password: _confirmPassword, ...nextValues } = values;
    setData(nextValues);
    router.push(ROUTES.REGISTER_STEP_2);
  };

  return (
    <Block safe keyboard color={colors.background} marginTop={sizes.md}>
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
          <Text h4 marginLeft={sizes.s}>
            Account info step 1
          </Text>
        </Block>

        {/* Email */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                id="email"
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                ref={ref}
                error={errors.email?.message}
                success={dirtyFields.email && !errors.email}
                placeholder="you@example.com"

              />
            )}
          />
        </Block>

        {/* First Name */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="first_name"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                id="firstName"
                label="First Name"
                autoCapitalize="words"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                ref={ref}
                error={errors.first_name?.message}
                success={dirtyFields.first_name && !errors.first_name}
                placeholder="your first name"
              />
            )}
          />
        </Block>

        {/* Last Name */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="last_name"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                id="last_name"
                label="Last Name"
                autoCapitalize="words"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                ref={ref}
                error={errors.last_name?.message}
                success={dirtyFields.last_name && !errors.last_name}
                placeholder="your last name"

              />
            )}
          />
        </Block>

        {/* Gender */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="gender"
            render={({ field, fieldState }) => (
              <SelectInput
                label="Gender"
                options={['Male', 'Female']}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </Block>

        {/* DOB */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="dob"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <DatePicker
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
                value={value}
                error={error?.message}
                onChange={onChange}
                minimumDate={new Date(1990, 0, 1)} // optional
                maximumDate={new Date()}            // today
              />
            )}
          />
        </Block>

        {/* Country */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="country"
            render={({ field, fieldState }) => (
              <Input
                id="country"
                label="Country"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.country && !errors.country}
                placeholder="Enter your country"

              />
            )}
          />
        </Block>

        {/* State */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="state"
            render={({ field, fieldState }) => (
              <Input
                id="state"
                label="State"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.state && !errors.state}
                placeholder="Enter your state"

              />
            )}
          />
        </Block>

        {/* City */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="city"
            render={({ field, fieldState }) => (
              <Input
                id="city"
                label="City"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error?.message}
                success={dirtyFields.city && !errors.city}
                placeholder="Enter your city"

              />
            )}
          />
        </Block>

        {/* Visibility */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="visibility"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <SelectInput
                label="Visibility"
                options={['Public', 'Private', 'Matched Only']}
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        </Block>

        {/* Password */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                id="password"
                label="Password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                ref={ref}
                error={errors.password?.message}
                success={dirtyFields.password && !errors.password}
                placeholder="********"

              />
            )}
          />
        </Block>

        {/* Confirm Password */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                id="confirm_password"
                label="Confirm Password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                ref={ref}
                error={errors.confirm_password?.message}
                success={dirtyFields.confirm_password && !errors.confirm_password}
                placeholder="********"

              />
            )}
          />
        </Block>

        {/* Next Button */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Button
            disabled={isSubmitting}
            shadow={!isAndroid}
            gradient={gradients.primary}
            onPress={handleSubmit(onSubmit)}
          >
            <Text white>Next</Text>
          </Button>
        </Block>
      </Block>
    </Block >
  );
}
