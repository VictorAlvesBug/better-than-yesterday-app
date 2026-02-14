import { StyleProp, View, ViewStyle } from 'react-native';
import { Button } from '../button';

type ManagePlansProps = {
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function ManagePlans({ className, style }: ManagePlansProps) {
  return (
    <View
      style={style}
      className={`fixed w-full px-4 gap-3 ${className || ''}`}
    >
      <Button
        text="Criar Novo Plano"
        action={() => console.log('Criar Novo Plano')}
      />
      <Button
        text="Tenho um Link de Convidado"
        action={() => console.log('Tenho um Link de Convidado')}
      />
      <Button
        text="Planos Populares"
        action={() => console.log('Planos Populares')}
      />
    </View>
  );
}
