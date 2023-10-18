import { View, Text,Image } from 'react-native'
import React,{useState} from 'react'
import {Slider} from '@miblanchard/react-native-slider';
import CustomSlider2 from './CustomSlider2';
import CustomSlider from './CustomSlider';
// import CustomSlider from './CustomSlider'

const App = () => {
  const [amount,setAmount] = useState(0.2)
  return (
    <View style={{flex:1,flexDirection:'column',justifyContent:'center',paddingHorizontal:15}}>
      <Text>Acceptance Limit: BDT {amount}</Text>
      {/* @miblanchard/react-native-slider */}
      <Slider
        value={amount}
        onValueChange={value => setAmount(value)}
        minimumValue={0}
        maximumValue={5000}
        minimumTrackTintColor='#02B835'
        minimumTrackStyle={{ height:15,borderRadius:9 }}
        maximumTrackStyle={{ height:15,borderRadius:9 }}
        maximumTrackTintColor='#EEEEEE'
        thumbTintColor='#02B835'
        step={0.02}
        thumbStyle={{ width:30,height:30,backgroundColor:'white',borderColor:'#02B835',borderWidth:7,borderRadius:999 }}
        animationType='timing'
       
      />

      <View style={{ display:'flex',flexDirection:'row',justifyContent:'space-between' }}>
        <Text>BDT:0</Text>
        <Text>BDT:5000</Text>
      </View>

      
      <CustomSlider
      value={amount}
      onValueChange={value => setAmount(value)}
      minimumValue={0}
      maximumValue={5000}
      minimumTrackTintColor='#02B835'
      minimumTrackStyle={{ height:15,borderRadius:9 }}
      maximumTrackStyle={{ height:15,borderRadius:9 }}
      maximumTrackTintColor='#EEEEEE'
      thumbTintColor='#02B835'
      step={0.02}
      thumbStyle={{ width:30,height:30,backgroundColor:'white',borderColor:'#02B835',borderWidth:7,borderRadius:999 }}
      animationType='timing'
      />

      
     
    </View>
  )
}

export default App