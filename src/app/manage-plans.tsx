import { StyleProp, View, ViewStyle } from 'react-native';
import { Button } from '../components/button';

type ManagePlansProps = {
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function ManagePlansScreen({ className, style }: ManagePlansProps) {
  return (
    <View
      style={style}
      className={`fixed w-full px-4 gap-3 ${className || ''}`}
    >
      <Button action={() => console.log('Criar Novo Plano')}>
        Criar Novo Plano
      </Button>
      <Button action={() => console.log('Tenho um Link de Convidado')}>
        Tenho um Link de Convidado
      </Button>
      <Button action={() => console.log('Planos Populares')}>
        Planos Populares
      </Button>
    </View>
  );
}
