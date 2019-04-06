// @flow
type RequestWrapperState = {
  isStalled: boolean,
  isFetching: boolean,
  isFinished: boolean,
}

type OnStateChange = (state: RequestWrapperState) => any

type RequestWrapperHandlers = {|
  onStalled?: OnStateChange,
  onFetching?: OnStateChange,
  onFinished?: OnStateChange,
  onStateChange?: OnStateChange,
|}

type RequestWrapperParams = {
  id: string,
  request: Array<() => Promise<any>>,
  stalledDelay: number,
  ...RequestWrapperHandlers,
}

export const INITIAL_REQUEST_STATE = {
  id: '',
  isStalled: false,
  isFetching: false,
  isFinished: false,
  timesRun: 0,
}

export const createRequest = ({
  id,
  request,
  stalledDelay,
  onStalled,
  onFetching,
  onFinished,
  onStateChange,
}: RequestWrapperParams) => {
  const factory = {
    state: {
      id,
      isStalled: false,
      isFetching: false,
      isFinished: false,
      timesRun: 0,
    },

    request,
    stalledDelay,
    onStalled,
    onFetching,
    onFinished,
    onStateChange,
    stalledTimer: undefined,

    startStalledTimer() {
      this.stalledTimer = setTimeout(() => {
        if (this.state.isFinished === true) return
        this.setState({ isStalled: true }, this.onStalled || this.onStateChange)
      }, this.stalledDelay)
    },

    setState(nextState, callback) {
      this.state = {
        ...this.state,
        ...nextState,
      }
      if (callback) callback(this.state)
    },

    run(handlers) {
      // if handlers are defined at execution time, assign/override existing values
      if (handlers) {
        Object.keys(handlers).forEach(key => {
          this[key] = handlers[key]
        })
      }
      // should only run it once per multiple requests
      if (!this.state.isFetching) {
        this.setState(
          { isFetching: true, timesRun: this.state.timesRun + 1 },
          this.onFetching || this.onStateChange,
        )
      }

      if (this.stalledDelay) this.startStalledTimer()

      const onFinish = () => {
        clearTimeout(this.stalledTimer)

        this.setState(
          {
            isFinished: true,
            isFetching: false,
            isStalled: false,
          },
          this.onFinished || this.onStateChange,
        )
      }

      return Promise.all(this.request.map(req => req.call()))
        .then(payload => {
          onFinish()
          if (this.request.length === 1) return Promise.resolve(payload[0])
          return Promise.resolve(payload)
        })
        .catch(error => {
          onFinish()
          return Promise.reject(error)
        })
    },
  }

  return (handlers: RequestWrapperHandlers) => factory.run(handlers)
}
