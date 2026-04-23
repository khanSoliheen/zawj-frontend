// app/register/step5.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Block, Button, Image, Text } from '@/components';
import Checkbox from '@/components/checkbox';
import { ROUTES } from '@/constants/routes';
import { useData, useToast } from '@/hooks';
import SessionService from '@/services/session';
import type { RegistrationData } from '@/store/registration';
import { useRegistrationStore } from '@/store/registration';

const schema = z.object({
  terms_accepted: z.literal(true, { error: 'You must accept the Terms' }),
  islamic_policy_accepted: z.literal(true, { error: 'You must accept the Islamic Usage Policy' }),
});

type FormValues = z.infer<typeof schema>;

export default function Step5() {
  const router = useRouter();
  const { setData, data, reset } = useRegistrationStore();
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, gradients, assets } = theme;

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // defaultValues: data,
  });

  const onSubmit = async (values: FormValues) => {
    setData(values);
    const payload = { ...data, ...values } as RegistrationData;

    let userId = '';

    try {
      const user = await SessionService.register(payload);
      userId = user?.id ?? '';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create the account.';
      show('error', message);
      return;
    }

    if (!userId) {
      show('error', 'User was not created properly.');
      return;
    }

    try {
      await SessionService.signOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to finish account setup.';
      show('error', message);
      return;
    }

    reset();
    show('success', 'Account created. Please log in to continue.');
    router.replace(ROUTES.LOGIN);
  };

  return (
    <Block safe color={colors.background} >
      <Block paddingHorizontal={sizes.s}>
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
          <Text h4 marginLeft={sizes.s}>Step 5: Agreements</Text>
        </Block>

        {/* Terms & Conditions */}
        <Block row flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="terms_accepted"
            render={({ field }) => (
              <Block row center>
                <Checkbox
                  checked={!!field.value}
                  onPress={field.onChange}
                  marginRight={sizes.s}
                />
                <Text>I agree to Terms & Conditions</Text>
              </Block>
            )}
          />
        </Block>
        <Block row center flex={0} style={{ zIndex: 0 }}>
          {errors.terms_accepted?.message && (
            <Text color={colors.danger} marginTop={sizes.xs}>
              {errors.terms_accepted.message}
            </Text>
          )}
        </Block>

        {/* Islamic Policy */}
        <Block row flex={0} center style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="islamic_policy_accepted"
            render={({ field }) => (
              <Block row center>
                <Checkbox
                  checked={!!field.value}
                  onPress={field.onChange}
                  marginRight={sizes.s}
                />
                <Text>I agree to Islamic Usage Policy</Text>
              </Block>
            )}
          />
        </Block>
        <Block row center flex={0} style={{ zIndex: 0 }}>
          {errors.islamic_policy_accepted?.message && (
            <Text color={colors.danger} marginTop={sizes.xs}>
              {errors.islamic_policy_accepted.message}
            </Text>
          )}
        </Block>
        {/* Submit Button */}
        <Block flex={0} style={{ zIndex: 0 }} marginTop={sizes.l}>
          <Button onPress={handleSubmit(onSubmit)} gradient={gradients.primary}>
            <Text white>Submit</Text>
          </Button>
        </Block>
      </Block>
    </Block>
  );
}
