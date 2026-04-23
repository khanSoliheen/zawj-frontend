import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';

import Block from './block';
import Text from './text';
import { IUser } from '../constants/types';
import { useData } from '../hooks/useData';

const User = ({
  name,
  fiq,
  dob,
  about,
}: IUser) => {
  const { theme } = useData();
  const { gradients, sizes } = theme;
  // render card for Newest & Fashion
  return (
    <TouchableWithoutFeedback>
      <Block card padding={sizes.sm} marginTop={sizes.sm}>
        {/*<Image height={170} resizeMode="cover" source={{ uri: image }} />*/}
        <Text
          h5
          bold
          size={13}
          marginTop={sizes.s}
          transform="uppercase"
          marginLeft={sizes.xs}
          gradient={gradients.primary}>
          {name}
        </Text>
        <Text
          h5
          bold
          size={13}
          marginTop={sizes.s}
          transform="uppercase"
          marginLeft={sizes.xs}
          gradient={gradients.primary}>
          {fiq}
        </Text>
        <Text
          h5
          bold
          size={13}
          marginTop={sizes.s}
          transform="uppercase"
          marginLeft={sizes.xs}
          gradient={gradients.primary}>
          {dob}
        </Text>
        <Text
          p
          marginTop={sizes.s}
          marginLeft={sizes.xs}
          marginBottom={sizes.sm}>
          {about}
        </Text>

        {/* user details */}
        {/*{user?.name && (
          <Block row marginLeft={sizes.xs} marginBottom={sizes.xs}>
            <Image
              radius={sizes.s}
              width={sizes.xl}
              height={sizes.xl}
              source={{ uri: user?.avatar }}
              style={{ backgroundColor: colors.white }}
            />
            <Block justify="center" marginLeft={sizes.s}>
              <Text p semibold>
                {user?.name}
              </Text>
              <Text p gray>
                {t('common.posted', {
                  date: dayjs(timestamp).format('DD MMMM') || '-',
                })}
              </Text>
            </Block>
          </Block>
        )}*/}

        {/* location & rating */}
        {/*{(Boolean(location) || Boolean(rating)) && (
          <Block row align="center">
            <Image source={icons.location} marginRight={sizes.s} />
            <Text p size={12} semibold>
              {location?.city}, {location?.country}
            </Text>
            <Text p bold marginHorizontal={sizes.s}>
              •
            </Text>
            <Image source={icons.star} marginRight={sizes.s} />
            <Text p size={12} semibold>
              {rating}/5
            </Text>
          </Block>
        )}*/}
      </Block>
    </TouchableWithoutFeedback>
  );
}

export default User;
