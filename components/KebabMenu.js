import React, { useState } from "react";
import { Linking, View } from "react-native";
import { KebabIcon } from "components/Icon";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";

import useI18N from "hooks/use-i18n";
import useStyles from "hooks/use-styles";

import axios from "services/axios";

const KebabMenu = ({ items }) => {
  const { globalStyles } = useStyles();
  const { i18n } = useI18N();
  const [visible, setVisible] = useState(false);
  if (!items)
    items = [
      {
        label: i18n.t("global.viewOnWeb"),
        urlPath: `#`,
      },
      {
        label: i18n.t("global.documentation"),
        url: `https://disciple.tools/user-docs/disciple-tools-mobile-app/how-to-use/`,
      },
    ];
  return (
    <Menu
      visible={visible}
      anchor={
        <KebabIcon onPress={() => setVisible(true)} style={globalStyles.icon} />
      }
      onRequestClose={() => setVisible(false)}
    >
      {items?.map((item, idx) => {
        let url = null;
        if (item?.url) url = item?.url;
        if (item?.urlPath) {
          const baseUrl = axios?.defaults?.baseURL?.split("/wp-json")?.[0];
          if (baseUrl) url = `${baseUrl}/${item?.urlPath}`;
        }
        const _key = `${item?.url}-${idx}`;
        return (
          <View key={_key}>
            <MenuItem
              onPress={() => {
                if (item?.callback) {
                  item.callback();
                } else {
                  if (url) Linking.openURL(url);
                }
                setVisible(false);
              }}
            >
              {item?.label}
            </MenuItem>
            <MenuDivider />
          </View>
        );
      })}
    </Menu>
  );
};
export default KebabMenu;
