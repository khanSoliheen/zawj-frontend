import type { ImageSourcePropType } from 'react-native';

import type { ITheme } from '@/constants/types';

type ThemeAssets = ITheme['assets'];

export const getGenderAvatar = (
  assets: ThemeAssets,
  gender?: string | null,
): ImageSourcePropType => {
  if ((gender ?? '').trim().toLowerCase() === 'female') {
    return assets.avatarFemale;
  }

  return assets.avatarMale;
};

export const getUserAvatarSource = ({
  assets,
  avatarUrl,
  gender,
}: {
  assets: ThemeAssets;
  avatarUrl?: string | null;
  gender?: string | null;
}): ImageSourcePropType => {
  const normalizedAvatarUrl = avatarUrl?.trim();
  if (normalizedAvatarUrl) {
    return { uri: normalizedAvatarUrl };
  }

  return getGenderAvatar(assets, gender);
};
