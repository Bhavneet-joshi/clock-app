import React, { useCallback, useState, useEffect, memo } from 'react';
import { 
  FlatList, 
  View, 
  StyleSheet, 
  Platform, 
  NativeSyntheticEvent, 
  NativeScrollEvent,
  LayoutChangeEvent,
  ViewStyle
} from 'react-native';

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  itemHeight: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  initialScrollIndex?: number;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  showsVerticalScrollIndicator?: boolean;
  decelerationRate?: 'fast' | 'normal' | number;
  snapToInterval?: number;
  onScrollToIndexFailed?: (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => void;
}

function VirtualizedListComponent<T>(props: VirtualizedListProps<T>) {
  const {
    data,
    renderItem,
    keyExtractor,
    itemHeight,
    style,
    contentContainerStyle,
    initialScrollIndex,
    onScroll,
    onMomentumScrollEnd,
    showsVerticalScrollIndicator = false,
    decelerationRate = 'fast',
    snapToInterval,
    onScrollToIndexFailed
  } = props;
  
  const [listHeight, setListHeight] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Calculate buffer size based on device
  const bufferItems = Platform.OS === 'web' ? 5 : 10;
  
  // Calculate visible range
  const firstVisibleIndex = Math.max(0, Math.floor(scrollPosition / itemHeight) - bufferItems);
  const visibleItemCount = Math.ceil(listHeight / itemHeight) + bufferItems * 2;
  const lastVisibleIndex = Math.min(data.length - 1, firstVisibleIndex + visibleItemCount);
  
  // Prepare visible data with buffer
  const visibleData = data.slice(firstVisibleIndex, lastVisibleIndex + 1);
  
  // Create spacers for content before and after visible items
  const topSpacerHeight = firstVisibleIndex * itemHeight;
  const bottomSpacerHeight = (data.length - lastVisibleIndex - 1) * itemHeight;
  
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setListHeight(event.nativeEvent.layout.height);
  }, []);
  
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newScrollPosition = event.nativeEvent.contentOffset.y;
    setScrollPosition(newScrollPosition);
    
    // Pass the event to the parent if needed
    if (onScroll) {
      onScroll(event);
    }
  }, [onScroll]);
  
  // Get item layout for efficient scrolling
  const getItemLayout = useCallback((_, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index
  }), [itemHeight]);
  
  // Handle initial scroll index setup
  useEffect(() => {
    if (initialLoad && initialScrollIndex !== undefined) {
      setScrollPosition(initialScrollIndex * itemHeight);
      setInitialLoad(false);
    }
  }, [initialLoad, initialScrollIndex, itemHeight]);
  
  // Optimized key extractor that adjusts for virtualization
  const adjustedKeyExtractor = useCallback((item: T, index: number) => {
    return keyExtractor(item, index + firstVisibleIndex);
  }, [keyExtractor, firstVisibleIndex]);
  
  // Optimized render item function that adjusts for virtualization
  const adjustedRenderItem = useCallback(({ item, index }: { item: T; index: number }) => {
    return renderItem({ item, index: index + firstVisibleIndex });
  }, [renderItem, firstVisibleIndex]);
  
  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <FlatList
        data={visibleData}
        renderItem={adjustedRenderItem}
        keyExtractor={adjustedKeyExtractor}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        decelerationRate={decelerationRate}
        snapToInterval={snapToInterval}
        onScroll={handleScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        ListHeaderComponent={() => <View style={{ height: topSpacerHeight }} />}
        ListFooterComponent={() => <View style={{ height: bottomSpacerHeight }} />}
        contentContainerStyle={contentContainerStyle}
        onScrollToIndexFailed={onScrollToIndexFailed}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        shouldRasterizeIOS={Platform.OS === 'ios'}
        renderToHardwareTextureAndroid={Platform.OS === 'android'}
      />
    </View>
  );
}

// Use React.memo to prevent unnecessary renders
const VirtualizedList = memo(
  VirtualizedListComponent,
  (prevProps, nextProps) => {
    // Only re-render if these props change
    return (
      prevProps.data === nextProps.data &&
      prevProps.itemHeight === nextProps.itemHeight &&
      prevProps.initialScrollIndex === nextProps.initialScrollIndex
    );
  }
) as typeof VirtualizedListComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VirtualizedList; 