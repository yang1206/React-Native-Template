// TopSection.tsx
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

function TopSection() {
  return (
    <View style={styles.top}>
      <MaterialIcons name="account-circle" size={40} color="#fff" />
      <Text style={styles.welcomeText}>欢迎使用我们的应用！</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    height: 80, // 修改高度为固定值
    marginTop: 30, // 添加顶部外边距
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
})

export default TopSection
