import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, TouchableOpacity } from 'react-native';
import { z } from 'zod';

import { Block, Button, Image, Input, Text } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useAuth, useData, useToast } from '@/hooks';

const isAndroid = Platform.OS === 'android';
const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const { theme } = useData();
  // const { t } = useTranslation();
  const router = useRouter();
  const { show } = useToast();
  const { colors, gradients, sizes, assets } = theme;

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',            // validate on blur
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: FormValues) => {
    try {
      const user = await login({ email, password });

      if (!user) {
        show('error', 'Unable to start a session.');
        return;
      }

      show('success', 'You have successfully logged in.');
      router.replace(ROUTES.USERS);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to log in.';
      show('error', message);
    }
  };

  return (
    <Block safe color={colors.background} marginTop={sizes.md}>
      <Block paddingHorizontal={sizes.s}>
        {/* Email Field */}
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
                marginBottom={12}
              />
            )}
          />
        </Block>
        {/* Password Field */}
        <Block flex={0} style={{ zIndex: 0 }} marginTop={sizes.md}>
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
                marginBottom={12}
              />
            )}
          />
        </Block>
        <Block flex={0} style={{ zIndex: 0 }} marginTop={sizes.md}>
          <Button
            disabled={isSubmitting}
            shadow={!isAndroid}
            gradient={gradients.primary}
            marginTop={sizes.s}
            onPress={handleSubmit(onSubmit)}>
            <Text white>
              Login
            </Text>
          </Button>
        </Block>
        <TouchableOpacity onPress={() => router.push(ROUTES.REGISTER_STEP_1)}>
          <Block flex={0} row align='center' center marginTop={sizes.s}>
            <Text p semibold marginRight={sizes.s} color={colors.link}>
              Register
            </Text>
            <Image source={assets.arrow} color={colors.link} />
          </Block>
        </TouchableOpacity>
      </Block>
    </Block>
  );
}
