import {SafeAreaView, Dimensions} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Slider from 'rn-video-slider';

const App =()=>{
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
          <Slider thumbColor={'#ff00ff'}
                  trackColor={'#0000ff'}
                  progressColor={'#ff0000'}
                  width={Dimensions.get('window').width - 150}
                  onSlide={(value)=>console.log(value.toFixed(2))}
          />
      </SafeAreaView>
      </GestureHandlerRootView>
  )
}

export default App;