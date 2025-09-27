import { View, Text, Pressable, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadow } from '../theme';

export const Screen = ({ children, style }) => (
  <View style={[{ flex:1, backgroundColor: colors.bg, padding:16 }, style]}>
    <StatusBar style="dark" />
    {children}
  </View>
);

export const Card = ({ children, style }) => (
  <View style={[{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth:1, borderColor:colors.border, padding:14 }, shadow, style]}>
    {children}
  </View>
);

export const H1 = ({ children, style }) => (
  <Text style={[{ fontSize:22, fontWeight:'800', color:colors.text, marginBottom:12 }, style]}>{children}</Text>
);

export const P = ({ children, style }) => (
  <Text style={[{ fontSize:14, color:colors.muted }, style]}>{children}</Text>
);

export const Input = (props) => (
  <TextInput
    placeholderTextColor="#9CA3AF"
    {...props}
    style={[{ backgroundColor:'#fff', borderRadius:radii.md, borderWidth:1, borderColor:colors.border, padding:12 }, props.style]}
  />
);

export const PrimaryButton = ({ title, onPress, disabled, style }) => (
  <Pressable onPress={onPress} disabled={disabled}
    style={[{ backgroundColor: colors.primary, padding:14, borderRadius:radii.md, opacity: disabled?0.6:1 }, style]}>
    <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>{title}</Text>
  </Pressable>
);

export const IconButton = ({ name, onPress, size=22 }) => (
  <Pressable onPress={onPress} style={{ padding:8 }}>
    <Ionicons name={name} size={size} />
  </Pressable>
);

export const HeaderTitle = ({ title }) => (
  <Text style={{ fontSize:16, fontWeight:'800', color:colors.text }}>{title}</Text>
);

// Evita que el router lo considere "route" si alguna vez queda dentro de /app
export default {};