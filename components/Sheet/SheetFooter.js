import React from "react";
import { Pressable, View, Text } from "react-native";
import { useBottomSheet } from "@gorhom/bottom-sheet";

import { DoneIcon, CancelIcon } from "components/Icon";

import useI18N from "hooks/use-i18n";
import useStyles from "hooks/use-styles";

import { localStyles } from "./SheetFooter.styles";

const SheetFooter = ({ label, renderIcon, onPress }) => {
  const { styles, globalStyles } = useStyles(localStyles);
  return (
    <Pressable onPress={() => onPress()}>
      <View style={[globalStyles.rowContainer, styles.container]}>
        <View>{renderIcon}</View>
        <Text>{label}</Text>
      </View>
    </Pressable>
  );
};

export const SheetFooterCancel = ({ onDismiss }) => {
  const { close } = useBottomSheet();
  const { i18n } = useI18N();
  const { globalStyles } = useStyles();
  const label = i18n.t("global.cancel");
  let onPress = () => close();
  if (onDismiss) {
    onPress = () => {
      onDismiss();
      close();
    };
  }
  return (
    <SheetFooter
      onPress={onPress}
      label={label}
      renderIcon={<CancelIcon style={globalStyles.icon} />}
    />
  );
};

export const SheetFooterDone = ({ onDone }) => {
  const { close } = useBottomSheet();
  const { i18n } = useI18N();
  const { globalStyles } = useStyles();
  const label = i18n.t("global.done");
  let onPress = () => close();
  if (onDone) {
    onPress = () => {
      onDone();
      close();
    };
  }
  return (
    <SheetFooter
      onPress={onPress}
      label={label}
      renderIcon={<DoneIcon style={globalStyles.icon} />}
    />
  );
};

export default SheetFooter;
