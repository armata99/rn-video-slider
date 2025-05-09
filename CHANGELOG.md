
## [v3.6.1] - 2025-05-09
### :bug: Bug Fixes
- [`f354f5f`](https://github.com/armata99/rn-video-slider/commit/f354f5fc01d873213f3514ae2450d045624b7869) - quick fix to prevent duplicate react due to it being listed in dependencies *(PR [#4](https://github.com/armata99/rn-video-slider/pull/4) by [@armata99](https://github.com/armata99))*


## [v0.6.0] - 2025-04-13
### :sparkles: New Features
- [`2826846`](https://github.com/armata99/rn-video-slider/commit/2826846ce325e974b0ece92e8b25ef06e75a74dc) - style override for thumb view *(commit by [@armata99](https://github.com/armata99))*
- [`f75a237`](https://github.com/armata99/rn-video-slider/commit/f75a2373dc27c795e412226c25a731de3efa75e9) - hovering bubble view over progress thumb view *(commit by [@armata99](https://github.com/armata99))*

### :recycle: Refactors
- [`c5eede9`](https://github.com/armata99/rn-video-slider/commit/c5eede99afec5fd4e284059ff10d3728aac755e7) - props and ref interfaces are renamed *(commit by [@armata99](https://github.com/armata99))*
- [`08f25ae`](https://github.com/armata99/rn-video-slider/commit/08f25ae49a4e04e12a19b88047f8d3f9066c4591) - change in linking structure to support instant code modification of library in test app *(commit by [@armata99](https://github.com/armata99))*
- [`bafefb7`](https://github.com/armata99/rn-video-slider/commit/bafefb778b6b9b712e82f390f0fc91b20fc2713b) - relocated and renamed some of the functions and added memoize *(commit by [@armata99](https://github.com/armata99))*


## [v0.5.1] - 2024-12-15
### :bug: Bug Fixes
- [`0b42834`](https://github.com/armata99/rn-video-slider/commit/0b42834319d1f38c633a3ef6dda25ae95111c98e) - relocated isSliding reference into slide start/finish callbacks *(commit by [@armata99](https://github.com/armata99))*

### :recycle: Refactors
- [`494abfe`](https://github.com/armata99/rn-video-slider/commit/494abfe333319dae5b20f9699e577391156ca3c3) - introduced a new interface for slider's reference *(commit by [@armata99](https://github.com/armata99))*


## [v0.5.0] - 2024-12-14
### :sparkles: New Features
- [`ebd5fef`](https://github.com/armata99/rn-video-slider/commit/ebd5fef476cec30e0c09d9993c79da84617a867d) - added props for initial progress and buffer initial progress *(commit by [@armata99](https://github.com/armata99))*
- [`a4a3490`](https://github.com/armata99/rn-video-slider/commit/a4a34904fd0441925a96a431ddbf974ba80deab0) - internal mechanism to prevent feeding slider's callback into via ref methods *(commit by [@armata99](https://github.com/armata99))*

### :wrench: Chores
- [`30e3058`](https://github.com/armata99/rn-video-slider/commit/30e305830c3fb6ece2cc06dadbad1ad0e06401e4) - bumped test app dependencies to rn 0.76.3 *(commit by [@armata99](https://github.com/armata99))*


## [v0.4.1] - 2024-09-28
### :bug: Bug Fixes
- [`b2e50f0`](https://github.com/armata99/rn-video-slider/commit/b2e50f0338e524888546c7b1f147f7b565634061) - no thumb shadow on ios *(commit by [@armata99](https://github.com/armata99))*
- [`2fd9ae6`](https://github.com/armata99/rn-video-slider/commit/2fd9ae6680dffd82fbf7c6ef8f8b941bf7cf9732) - direction independence in android *(commit by [@armata99](https://github.com/armata99))*

### :recycle: Refactors
- [`caec60d`](https://github.com/armata99/rn-video-slider/commit/caec60d603d67f32fd7cb93cc160e585be122985) - config variables renamed *(commit by [@armata99](https://github.com/armata99))*

### :wrench: Chores
- [`34a3191`](https://github.com/armata99/rn-video-slider/commit/34a31916425bd55de854222e35afe472ebe1bdf2) - bumping test app and its dependencies up *(commit by [@armata99](https://github.com/armata99))*
- [`b5bf5f0`](https://github.com/armata99/rn-video-slider/commit/b5bf5f03fd28167f311e3943e01d8fedac943d7d) - cleaned stylesheet and code *(commit by [@armata99](https://github.com/armata99))*


## [v0.4.0] - 2024-06-29
### :bug: Bug Fixes
- [`3f04595`](https://github.com/armata99/rn-video-slider/commit/3f0459551b68ad766fcf9e39a65bd3f009b6b0ca) - wrong initial progress due to offsetOverflow *(commit by [@armata99](https://github.com/armata99))*
- [`6544963`](https://github.com/armata99/rn-video-slider/commit/654496351039911f4aafb35a2bb0237134c17a42) - structural changes in tap gesture implementation *(commit by [@armata99](https://github.com/armata99))*

### :wrench: Chores
- [`83f1fae`](https://github.com/armata99/rn-video-slider/commit/83f1faefb23a999012384730937e0fc660a97acd) - example improvement *(commit by [@armata99](https://github.com/armata99))*


## [v0.3.2] - 2024-06-19
### :bug: Bug Fixes
- [`eef724e`](https://github.com/armata99/rn-video-slider/commit/eef724e05bc8a39b93f12f86003fe87815eb6ad3) - tapping resets progress to zero on rtl screens *(commit by [@armata99](https://github.com/armata99))*


## [v0.3.1] - 2024-04-22
### :bug: Bug Fixes
- [`25b37bb`](https://github.com/armata99/rn-video-slider/commit/25b37bbcccc6b506614972aa3f325e74710f0963) - delay between thumb and track while sliding fast *(commit by [@armata99](https://github.com/armata99))*


[v0.3.1]: https://github.com/armata99/rn-video-slider/compare/v0.3.0...v0.3.1
[v0.3.2]: https://github.com/armata99/rn-video-slider/compare/v0.3.1...v0.3.2
[v0.4.0]: https://github.com/armata99/rn-video-slider/compare/v0.3.2...v0.4.0
[v0.4.1]: https://github.com/armata99/rn-video-slider/compare/v0.4.0...v0.4.1
[v0.5.0]: https://github.com/armata99/rn-video-slider/compare/v0.4.1...v0.5.0
[v0.5.1]: https://github.com/armata99/rn-video-slider/compare/v0.5.0...v0.5.1
[v0.6.0]: https://github.com/armata99/rn-video-slider/compare/v0.5.1...v0.6.0
[v3.6.1]: https://github.com/armata99/rn-video-slider/compare/v0.6.0...v3.6.1