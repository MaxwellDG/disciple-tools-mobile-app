import React from "react";
import { Pressable, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import {
  AlertProgressIcon,
  CommentActivityIcon,
  LeaderIcon,
  MeatballIcon,
  StarIcon,
  StarOutlineIcon
} from "components/Icon";
import PostItemSkeleton from "./PostItemSkeleton";
import SelectSheet from "components/Sheet/SelectSheet";
import SheetHeader from "components/Sheet/SheetHeader";

import useAPI from "hooks/use-api";
import useBottomSheet from "hooks/use-bottom-sheet";
import useHaptics from "hooks/use-haptics";
import useI18N from "hooks/use-i18n";
import useSettings from "hooks/use-settings";
import useStyles from "hooks/use-styles";
import useType from "hooks/use-type";

import { ScreenConstants, SubTypeConstants } from "constants";

import { parseDateSafe, titleize, truncate } from "utils";

import { localStyles } from "./PostItem.styles";

const PostItem = ({ item, loading, mutate }) => {
  const navigation = useNavigation();
  const { expand } = useBottomSheet();
  const { i18n, moment, numberFormat } = useI18N();
  const { vibrate } = useHaptics();
  const { styles, globalStyles } = useStyles(localStyles);
  const { updatePost } = useAPI();

  const generateOptions = () => {
    const sections = [
      {
        data: [
          {
            key: "commentsActivity",
            label: i18n.t("global.commentsActivity"),
            icon: <CommentActivityIcon />,
          },
        ],
      },
    ];
    return sections;
  };

  const onChange = (value) => {
    const key = value?.key;
    if (key === "commentsActivity") {
      navigation.push(ScreenConstants.COMMENTS_ACTIVITY, {
        id: item?.ID,
        name: item?.title,
        type: item?.post_type,
        subtype: SubTypeConstants.COMMENTS_ACTIVITY
      });
    };
    return null;
  };

  const showSheet = (item) => {
    const title = item?.name;
    const sections = generateOptions();
    expand({
      snapPoints: ["33%","95%"],
      dismissable: true,
      defaultIndex: 0,
      renderHeader: () => (
        <SheetHeader
          expandable
          dismissable
          title={title}
        />
      ),
      renderContent: () => (
        <SelectSheet
          sections={sections}
          onChange={onChange}
        />
      )
    });
  };

  const onLongPress = () => null;

  const PostTitle = () => {
    const title = item?.name ? item.name : item?.title;
    return (
      <Text style={[globalStyles.text, styles.title]}>
        {titleize(title)}
      </Text>
    );
  };

  const PostSubtitle1 = () => {
    const { isGroup, postType } = useType();
    const { settings } = useSettings({ type: postType });
    if (!settings) return null;
    // TODO: constants?
    let subtitle1Key = "overall_status";
    if (isGroup) subtitle1Key = "group_status";
    let subtitle2Key = "seeker_path";
    if (isGroup) subtitle2Key = "group_type";
    //
    const subtitle1 = settings?.fields?.[subtitle1Key]?.values[item?.[subtitle1Key]]?.label;
    const subtitle2 = settings?.fields?.[subtitle2Key]?.values[item?.[subtitle2Key]]?.label;
    //
    let subtitle = '';
    if (subtitle1) subtitle += subtitle1;
    if (subtitle2) {
      if (subtitle1) subtitle += ' • ';
      subtitle += subtitle2;
    };
    if (isGroup && item?.member_count) subtitle += ` • ${ numberFormat(item.member_count) }`;
    return (
      <Text style={globalStyles.caption}>
        { truncate(subtitle, { maxLength: 70 })}
      </Text>
    );
  };

  const PostSubtitle2 = () => {
    const { postType } = useType();
    const { settings } = useSettings({ type: postType });
    if (!settings) return null;
    const lastModDate = moment(parseDateSafe(item?.last_modified)).format('L');
    if (!lastModDate) return null;
    return (
      <View style={globalStyles.rowContainer}>
        <View>
          <Text
            style={[
              globalStyles.caption,
              styles.caption
            ]}
          >
            { lastModDate }
          </Text>
        </View>
        <InfoIcons />
      </View>
    );
  };

  const getStatusColor = (settings) => {
    if (item?.overall_status) return settings?.fields?.overall_status?.values?.[item.overall_status]?.color;
    if (item?.group_status) return settings?.fields?.group_status?.values?.[item.group_status]?.color;
    return settings?.fields?.status?.values?.[item?.status]?.color;
  };

  const StatusBorder = () => {
    const { settings } = useSettings();
    if (!settings) return null;
    const backgroundColor = getStatusColor(settings);
    return(
      <View
        style={{
          width: 10,
          backgroundColor
        }}
      />
    );
  };

  const FavoriteStar = () => {
    return (
      <Pressable
        onPress={() => {
          vibrate();
          updatePost({
            fields: { favorite: !item?.favorite },
            id: Number(item?.ID),
            type: item?.post_type,
            mutate,
          })
        }}
        style={globalStyles.columnContainer}
      >
        <View style={globalStyles.icon}>
          {item?.favorite ? (
            <StarIcon />
          ) : (
            <StarOutlineIcon />
          )}
        </View>
      </Pressable>
    );
  };
  const PostDetails = () => (
    <View style={[globalStyles.columnContainer, styles.detailsContainer]}>
      <PostTitle />
      <PostSubtitle1 />
      <PostSubtitle2 />
    </View>
  );

  const InfoIcons = () => (
    <>
      { item?.requires_update && (
        <View style={styles.infoIconContainer}>
          <AlertProgressIcon
            style={[
              styles.alertIcon,
              styles.infoIcon,
            ]}
          />
        </View>
      )}
      { item?.group_leader?.values?.length > 0 && (
        <View style={styles.infoIconContainer}>
          <LeaderIcon style={styles.infoIcon} />
        </View>
      )}
    </>
  );

  const SheetOptions = () => (
    <Pressable
      onPress={() => showSheet(item)}
      style={[
        styles.icon,
        styles.actionIcon
      ]}
    >
      <MeatballIcon />
    </Pressable>
  );

  if (!item || loading) return <PostItemSkeleton />;
  return (
    <View
      style={[
        globalStyles.rowContainer,
        styles.container
      ]}
    >
      <Pressable
        key={item?.ID}
        onPress={() => {
          navigation.push(ScreenConstants.DETAILS, {
            id: item?.ID,
            name: item?.title,
            type: item?.post_type,
          });
        }}
        //onLongPress={() => onLongPress()}
        style={[
          globalStyles.rowContainer,
          styles.subcontainer
        ]}
      >
        <StatusBorder />
        <View style={[
          globalStyles.rowContainer,
          styles.subsubcontainer
        ]}>
          <FavoriteStar />
          <PostDetails />
        </View>
      </Pressable>
      <SheetOptions />
    </View>
  );
};
/* NOTE: no performance improvements observed with this approach
const arePropsEqual = (prevProps, nextProps) => prevProps?.item?.ID === nextProps?.item?.ID;
export default React.memo(PostItem, arePropsEqual);
*/
export default PostItem;