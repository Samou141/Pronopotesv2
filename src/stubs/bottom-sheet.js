const React = require('react');
const { Modal, View, Pressable, ScrollView } = require('react-native');

const BottomSheet = React.forwardRef(function BottomSheet(
  { children, index, onChange, backgroundStyle, handleIndicatorStyle, enablePanDownToClose, backdropComponent },
  ref,
) {
  const [visible, setVisible] = React.useState(index !== -1);

  React.useEffect(() => {
    setVisible(index !== -1);
  }, [index]);

  React.useImperativeHandle(ref, () => ({
    close: () => { setVisible(false); onChange?.(-1); },
    expand: () => setVisible(true),
    collapse: () => setVisible(true),
    snapToIndex: () => setVisible(true),
  }));

  if (!visible) return null;

  return React.createElement(
    Modal,
    { transparent: true, animationType: 'slide', visible },
    React.createElement(
      Pressable,
      { style: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }, onPress: enablePanDownToClose ? () => { setVisible(false); onChange?.(-1); } : undefined },
      React.createElement(
        Pressable,
        { style: [{ maxHeight: '80%', backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24 }, backgroundStyle] },
        children,
      ),
    ),
  );
});

const BottomSheetView = ({ children, style }) => React.createElement(ScrollView, { style, contentContainerStyle: { paddingBottom: 40 } }, children);
const BottomSheetBackdrop = () => null;
const BottomSheetModalProvider = ({ children }) => React.createElement(React.Fragment, null, children);
const BottomSheetModal = BottomSheet;

module.exports = { default: BottomSheet, BottomSheet, BottomSheetView, BottomSheetBackdrop, BottomSheetModalProvider, BottomSheetModal };
module.exports.default = BottomSheet;
