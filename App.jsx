import { View, Text,Image } from 'react-native'
import React,{useState} from 'react'
// import {Slider} from '@miblanchard/react-native-slider';
// import Slider from './app/slider/Slider'
// import Slider2 from './app/slider/Slider2';
// import Sliders from './app/slider/BalanceSlider';
import BalanceSlider from './app/slider/BalanceSlider';
import CustomPanResponder from './app/pan-responder/CustomPanResponder';
// import CustomSlider from './CustomSlider'

const App = () => {
  const [amount, setAmount] = useState(0);

  return (
    <View style={{flex:1,flexDirection:'column',justifyContent:'center',paddingHorizontal:15}}>
      <Text>Acceptance Limit: BDT {amount}</Text>
      {/* @miblanchard/react-native-slider */}
      {/* <Slider
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
       
      /> */}

      <View style={{ display:'flex',flexDirection:'row',justifyContent:'space-between' }}>
        <Text>BDT:0</Text>
        <Text>BDT:5000</Text>
      </View>

      
      {/* <Slider
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
      /> */}

{/* <Slider
      value={amount}
      onValueChange={(changedtext) => handleValueChange(changedtext)}
      minimumValue={0}
      maximumValue={100}
      minimumTrackTintColor='#02B835'
      minimumTrackStyle={{ height:15,borderRadius:9 }}
      maximumTrackStyle={{ height:15,borderRadius:9 }}
      maximumTrackTintColor='#EEEEEE'
      thumbTintColor='#02B835'
      step={0.2}
      thumbStyle={{ width:30,height:30,backgroundColor:'white',borderColor:'#02B835',borderWidth:7,borderRadius:999 }}
      animationType='timing'
      /> */}

{/* <Slider
      value={amount}
      onValueChange={(changedtext) => handleValueChange(changedtext)}
      minimumValue={0}
      maximumValue={100}
      minimumTrackTintColor='yellow'
      minimumTrackStyle={{ height:15,borderRadius:9 }}
      maximumTrackStyle={{ height:15,borderRadius:9 }}
      maximumTrackTintColor='#EEEEEE'
      thumbTintColor='#02B835'
      step={0.2}
      thumbStyle={{ width:30,height:30,backgroundColor:'white',borderColor:'#02B835',borderWidth:7,borderRadius:999 }}
      animationType='timing'
      /> */}

      <BalanceSlider
       value={amount}
       onValueChange={changedAmount => setAmount(changedAmount)}
       minimumValue={50}
       maximumValue={5000}
       minimumTrackTintColor='#02B835'
       thumbStyle={{width:30,height:30,backgroundColor:'white',borderColor:'#02B835',borderWidth:7,borderRadius:999}}
       minimumTrackStyle={{ height:15,borderRadius:9 }}
       maximumTrackStyle={{ height:15,borderRadius:9 }}
       maximumTrackTintColor='#EEEEEE'
       thumbTintColor='#02B835'
      />

    {/* <CustomPanResponder/> */}

     
    </View>
  )
}

export default App