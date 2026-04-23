import { router } from 'expo-router';
import React, { useState } from 'react';

import { Block, Button, Image, Text } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useData } from '@/hooks';

export default function FaqScreen() {
  const { theme } = useData();
  const { colors, sizes, assets } = theme;
  const [openQuestion, setOpenQuestion] = useState<string | null>('Can anyone see my full profile?');

  const Item = ({ question, answer }: { question: string; answer: string }) => {
    const isOpen = openQuestion === question;

    return (
      <Block
        marginTop={sizes.m}
        radius={sizes.cardRadius}
        color={colors.card}
        style={{
          borderColor: colors.secondary,
          borderWidth: 1,
          overflow: 'hidden',
        }}
      >
        <Button
          row
          justify="space-between"
          align="center"
          padding={sizes.m}
          onPress={() => setOpenQuestion((current) => (current === question ? null : question))}
        >
          <Text p semibold style={{ flex: 1, paddingRight: sizes.s }}>
            {question}
          </Text>
          <Text p semibold color={colors.link}>
            {isOpen ? '−' : '+'}
          </Text>
        </Button>

        {isOpen ? (
          <Block
            paddingHorizontal={sizes.m}
            paddingBottom={sizes.m}
            style={{
              borderTopColor: colors.secondary,
              borderTopWidth: 1,
            }}
          >
            <Text p color={colors.gray} marginTop={sizes.s}>
              {answer}
            </Text>
          </Block>
        ) : null}
      </Block>
    );
  };

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
      <Block row flex={0} align="center" justify="space-between" paddingVertical={sizes.s} marginBottom={sizes.sm}>
        <Button onPress={() => router.back()}>
          <Image
            radius={0}
            width={10}
            height={18}
            color={colors.link}
            source={assets.arrow}
            transform={[{ rotate: '180deg' }]}
          />
        </Button>
        <Text h5 semibold>FAQ</Text>
        <Block width={40} />
      </Block>

      <Block scroll paddingHorizontal={sizes.md} contentContainerStyle={{ paddingBottom: sizes.xl }}>
        <Text p color={colors.gray}>
          Quick answers to the most common questions about profiles, privacy, chat, and account settings in Zawj.
        </Text>

        <Item
          question="Can anyone see my full profile?"
          answer="Only users who can access the app can browse public profiles. Some visibility and messaging controls are available in your settings."
        />
        <Item
          question="Why can I not message everyone directly?"
          answer="Some flows depend on connection state and visibility settings. The app is designed to keep interactions more intentional than open chat."
        />
        <Item
          question="How do I report or block someone?"
          answer="Open the relevant profile or use the Report Misconduct and Blocked Users settings screens. Reports and blocks are stored on the backend."
        />
        <Item
          question="Can I change my profile photo and details?"
          answer="Yes. Use Edit Profile for profile details and tap your avatar from the profile screens to upload or replace your photo."
        />
        <Item
          question="What happens if I delete my account?"
          answer="Account deletion is a soft delete. Your account is removed from active use, you are signed out, and the same email cannot be used to register again."
        />

        <Block marginTop={sizes.m}>
          <Button onPress={() => router.push(ROUTES.SUPPORT)}>
            <Text p semibold color={colors.link}>Contact Support</Text>
          </Button>
        </Block>
      </Block>
    </Block>
  );
}
