# rn-video-slider
A dedicated progress slider for video player's custom user interfaces
in React-Native. It can also be used in audio players because why not? 😎

<img src="https://github.com/armata99/assets/blob/master/rn-video-slider/main.gif" alt="Demonstration">
<img src="https://github.com/armata99/assets/blob/master/rn-video-slider/buffer.gif" alt="Buffer Demonstration">
<img src="https://github.com/armata99/assets/blob/master/rn-video-slider/bubble.gif" alt="Bubble Demonstration">

## Why this module?
- superior performance thanks to Reanimated library
- clean and simple implementation that makes it easy to extend
- integrated buffer indicator for online streams
- fully written in Typescript
- easiest way to use
- RTL support

## Installation
This module uses `react-native-reanimated` and `react-native-gesture-handler` as 
peer dependencies. make sure You have installed them correctly. You may also install
`react-native-video`. Check out these links to proceed their installation process:
- [reanimated installation](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started#installation)
- [gesture-handler installation](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)
- [video installation](https://react-native-video.github.io/react-native-video/installation)

Once you are done with above, add the main package with one of below commands: 
### using npm
```sh
npm i rn-video-slider
```

### using yarn
```sh
yarn add rn-video-slider
```
### 🚨Important Note
Since version 6, I restructuted the project to be able to develop it easier using the TestApp. Therefore, some of the
TestApp dependencies are listed at root project and they are going to cause errors. To prevent this, simply add below
line to `postinstall` section of `scripts` at your project's `package.json`

```sh
rm -rf node_modules/rn-video-slider/node_modules/
```

That will be it.

## Usage

```typescript jsx
import {Dimensions} from "react-native";
import Slider, {SliderRef} from "rn-video-slider";

const ControlSet = () => {

  const sliderRef = React.createRef<SliderRef>();
  //call below function in video progress callback
  //sliderRef.current?.setProgress(0.5);

  const _onSlide = (value: number) => {
    //seek your video with value
  };
  
  //this simply means 80% of screen's width
  const sliderWdith = Dimensions.get('window').width * 0.8;

  return (
    <Slider
      ref={sliderRef}
      width={sliderWdith}
      onSlide={_onSlide}
    />
  )
}
```
**Note:** You can see the Component in action by cloning this
repo and building its test app. Just head over to `testapp`
directory, install the dependencies and run it on Android or IOS.

## Slider Properties
Here is the list of properties that you can set or override.

|         Name          |         Type          | Required |     Default Value     | Description                                                                                                          |
|:---------------------:|:---------------------:|:--------:|:---------------------:|----------------------------------------------------------------------------------------------------------------------|
|         width         |        number         |   Yes    |       undefined       | width of slider track                                                                                                |
|        height         |        number         |    No    |           3           | height of slider track                                                                                               |
|       thumbSize       |        number         |    No    |          12           | diameter of sliding thumb                                                                                            |
|      thumbColor       |        string         |    No    |        #FFFFFF        | color of sliding thumb                                                                                               |
|      thumbStyle       |       ViewStyle       |    No    |       undefined       | style override for thumb view. It has higher priority than thumbSize and thumbColor.                                 |
|     progressColor     |        string         |    No    |        #FFFFFF        | color of progress indicator                                                                                          |
|  bufferProgressColor  |        string         |    No    | rgba(255,255,255,0.5) | color of buffer progress indicator                                                                                   |
|      trackColor       |        string         |    No    | rgba(255,255,255,0.2) | color of underlying view                                                                                             |
|       rootStyle       |       ViewStyle       |    No    |       undefined       | style addon for root view                                                                                            |
|         isRTL         |        boolean        |    No    |   I18nManager.isRTL   | overrides direction of movement. setting to "true" makes the slider animate from right to left.                      |
|       tapActive       |        boolean        |    No    |         true          | activates tap gesture. when set to "true", onSlide function fires on receiving single taps.                          |
|    initialProgress    |        number         |    No    |           0           | sets the initial progress value.                                                                                     |
| bufferInitialProgress |        number         |    No    |           0           | sets the initial buffer progress value.                                                                              |
| bubbleContainerStyle  |       ViewStyle       |    No    |           0           | style object that overrides default style of bubble container view which is absolutely positioned inside thumb view. |
|   bubbleVisibility    | 'always' \| 'onTouch' |    No    |          No           | determines when bubble should be displayed                                                                           | determines when bubble should show up |

**Note:** Root view has a default padding equal to 10.
Override it in root style if you need to.

**Note2:** You can disable thumb shadow by passing appropriate thumbStyle. (`elevation: 0, shadowOpacity: 0`)

## Event properties
Here is the list of events that slider fires.

|     Name      | Params | Description                                                                                                                                 |
|:-------------:|:------:|---------------------------------------------------------------------------------------------------------------------------------------------|
|    onSlide    | value  | Called when the slider is being moved via a pan or tap gesture. It passes a "value" which is a number that changes from 0 to 1.             |
| onSlideStart  | value  | Called when one of tapping or sliding gestures start. It passes the current progress as "value".                                            |
| onSlideFinish | value  | Called when one of tapping or sliding gestures finish. It passes the current progress as "value".                                           |
| renderBubble  | value  | Called when thumb is being held via touch gesture. It passes the current progress as "value". Use it to render hovering bubble above thumb. |


## Reference Methods
Here is the list of methods that can be called via reference.

|       Name        | Params | Description                                        |
|:-----------------:|:------:|----------------------------------------------------|
|    setProgress    | value  | Animates main progress slider based on given value |
|  setColdProgress  | value  | Sets main progress level without any animation     |
| setBufferProgress | value  | Sets progress level of the buffer indicator        |

**Note:** progress values are a float from 0 to 1

## How To Render Hovering Bubble
You can either use the built-in bubble component or render your own. Read below to proceed with the built-in one.

### Example 

```typescript jsx
import {Dimensions} from "react-native";
//1. import the bubble
import Slider, {Bubble} from "rn-video-slider";

const Example = () => {
  
  const sliderWdith = Dimensions.get('window').width * 0.8;

  //2. make a rendering function for it.
  // head over to `testapp/src/conveter.ts` to see the `progressToVideoTime` function
  const _renderBubble = (progress: number) => {
    return <Bubble text={progressToVideoTime(progress, videoLength.current)} />;
  };

  //3. use it
  return (
    <Slider
      width={sliderWdith}
      renderBubble={_renderBubble}
    />
  )
}
```

### Bubble Properties

|    Name     |    Type     | Required | Default Value | Description                                                                                              |
|:-----------:|:-----------:|:--------:|:-------------:|----------------------------------------------------------------------------------------------------------|
| `rootStyle` | `ViewStyle` |    No    |  `undefined`  | Custom style object for the bubble's root view                                                           |
|   `text`    |  `string`   |   Yes    |  `undefined`  | Text to display at center of bubble (Usually it's video time for corresponding to the current progress.) |
| `textStyle` | `TextStyle` |    No    |  `undefined`  | Custom style object for the bubble's text element                                                        |

## TODO list
- [x] ~~add hovering bubble feature~~
- [x] ~~add in-code docs~~
- [x] ~~ensure fabric support~~
- [x] ~~more and better demo gifs~~
- [x] ~~cleanups and refactors~~
- [x] ~~bump test-app dependencies up~~
- [x] ~~write a better example~~
- [x] ~~fix delay between thumb and track while sliding fast~~
- [x] ~~implement tap to seek feature~~
- [x] ~~replace the deprecated `useAnimatedGestureHandler` with newer API~~
- [x] ~~add style prop for root view~~


## Contributions
If you have any idea to improve or fix something, open an issue and state
it in details. You will always be welcomed.

## Compatability
- `react-native-reanimated`: `2.x`, `3.x`
- `react-native-gesture-handler`: `2.x`

## Acknowledgement
The idea behind this is from `react-native-reanimated-slider`.
Since the mentioned module is written with Reanimated v1 API, and hasn't
been updated for a long time, I decided to remake it.

## License
[MIT License](https://opensource.org/licenses/MIT)
