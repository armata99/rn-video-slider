import {SafeAreaView} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import VideoComponent from "./VideoComponent";

const App = () => {
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaView style={{flex: 1}}>
                <VideoComponent />
            </SafeAreaView>
        </GestureHandlerRootView>
    )
}

export default App;