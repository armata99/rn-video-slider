# rn-video-slider
A dedicated progress slider for video players in React-native.

![Demo](/demo.gif)

## Why this module?
- superior performance thanks to Reanimated library
- clean and simple implementation that makes it easy to extend
- integrated buffer indicator for online streams
- written in Typescript

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
npm install rn-video-slider
```

### using yarn
```sh
yarn add rn-video-slider
```
That will be it.

## Usage
```typescript jsx
import Slider, {ISlider} from "rn-video-slider";

const ControlSet=()=>{

    const sliderRef = React.createRef<ISlider>();
    //call below function in video progress callback
    //sliderRef.current?.setProgress(0.5);
    
    const _onSlide = (value: number) => {
        //seek your video with value
    };
    
    return (
        <Slider
            ref={sliderRef}
            width={400}
            onSlide={_onSlide}
        />
    )
}
```

## Properties
Here is the list of properties that you can set or override.

|        Name         |      Type       | Required |     Default Value     | Description                                                                                            |
|:-------------------:|:---------------:|:--------:|:---------------------:|--------------------------------------------------------------------------------------------------------|
|        width        |     number      |   Yes    |       undefined       | width of slider track                                                                                  |
|       height        |     number      |    No    |           3           | height of slider track                                                                                 |
|      thumbSize      |     number      |    No    |          12           | diameter of sliding thumb                                                                              |
|     thumbColor      |     string      |    No    |        #FFFFFF        | color of sliding thumb                                                                                 |
|    progressColor    |     string      |    No    |        #FFFFFF        | color of progress indicator                                                                            |
| bufferProgressColor |     string      |    No    | rgba(255,255,255,0.5) | color of buffer progress indicator                                                                     |
|     trackColor      |     string      |    No    | rgba(255,255,255,0.2) | color of underlying view                                                                               |
|      rootStyle      |    ViewStyle    |    No    |       undefined       | style addon for root view                                                                              |
|        isRTL        |     boolean     |    No    |   I18nManager.isRTL   | overrides direction of movement. setting to "true" makes the slider go from right to left.             |

**Note:** Root view has a default padding equal to 10.
Override it in root style if you need to.

## Callbacks properties
Here is the list of callbacks to use.

|     Name     |  Params   | Description                                                                                                 |
|:------------:|:---------:|-------------------------------------------------------------------------------------------------------------|
|   onSlide    |   value   | Called when the slider is being moved by swiping it manually. "value" is a number that changes from 0 to 1. |
| onSlideStart | undefined | Called when the thumb is being touched and held.                                                            |
| onSlideStop  | undefined | Called when the thumb is released.                                                                          |


## Methods
Here is the list of methods that can be called via reference.

|       Name        |  Params  | Description                                        |
|:-----------------:|:--------:|----------------------------------------------------|
|    setProgress    | progress | Animates main progress slider based on given value |
|  setColdProgress  | progress | Sets main progress level without any animation     |
| setBufferProgress | progress | Sets progress level of the buffer indicator        |

**Note:** progress values are a float from 0 to 1

## TODO
- [x] ~~add style prop for root view~~
- [ ] fix delay between thumb and track while sliding fast
- [ ] implement tap to seek feature
- [ ] write a better example
- [ ] replace the deprecated `useAnimatedGestureHandler` with newer API
- [ ] write necessary tests

## Contributions
If you have any idea to improve or fix something, open an issue and state
it in details. You will always be welcomed.

## Compatability
- `react-native-reanimated`: `2.x`, `3.x`
- `react-native-gesture-handler`: `2.x`

## Acknowledgement
The idea behind this is from `react-native-reanimated-slider`.
Since the mentioned module is written with Reanimated v1 API, and hasn't
been updated for a long period, I decided to remake it.

## License
[MIT License](https://opensource.org/licenses/MIT)
