import { message, Switch, SwitchProps } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';

interface InstantSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => Promise<void>;
  size?: SwitchProps['size'];
}

const InstantSwitch = memo<InstantSwitchProps>(({ enabled, onChange, size }) => {
  const prevValueRef = useRef(enabled);
  const [value, setValue] = useState(enabled);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    prevValueRef.current = enabled;
    setValue(enabled);
  }, [enabled]);

  return (
    <Switch
      loading={loading}
      onChange={async (enabled) => {
        setLoading(true);
        const previous = prevValueRef.current;
        setValue(enabled);

        try {
          await onChange(enabled);
          prevValueRef.current = enabled;
        } catch (error) {
          setValue(previous);
          message.error((error as Error)?.message || 'Switch update failed');
        } finally {
          setLoading(false);
        }
      }}
      size={size}
      value={value}
    />
  );
});

export default InstantSwitch;
