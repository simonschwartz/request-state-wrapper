import { createRequest } from './index'

const createMockRequest = ({ time, mockResponse, fail = false }) => () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) return reject(mockResponse)
      return resolve(mockResponse)
    }, time)
  })

describe('single request should', () => {
  let onStateChange
  let onFetching
  let onStalled
  let onFinished
  let mockResponse
  let mockAPIRequest

  beforeEach(() => {
    jest.clearAllMocks()
    onStateChange = jest.fn()
    onFetching = jest.fn()
    onStalled = jest.fn()
    onFinished = jest.fn()
    mockResponse = { data: 'mock-response-data' }
    mockAPIRequest = createMockRequest({ time: 50, mockResponse })
  })

  test('correctly return state to onStateChange() for non-stalled requests', async () => {
    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: mockAPIRequest,
      stalledDelay: 55,
      onStateChange,
    })

    const result = await mockRequest()

    expect(onStateChange.mock.calls).toEqual([
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: true,
          isFinished: false,
          isStalled: false,
          timesRun: 1,
        },
      ],
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: false,
          isFinished: true,
          isStalled: false,
          timesRun: 1,
        },
      ],
    ])

    expect(result).toEqual(mockResponse)
  })

  test('correctly return state to onFetching(), onStalled() and onFinsihed() for non-stalled requests', async () => {
    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest],
      stalledDelay: 55,
      onFetching,
      onStalled,
      onFinished,
    })

    const result = await mockRequest()
    expect(onFetching).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: true,
      isFinished: false,
      isStalled: false,
      timesRun: 1,
    })
    expect(onStalled).not.toBeCalled()
    expect(onFinished).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: false,
      isFinished: true,
      isStalled: false,
      timesRun: 1,
    })

    expect(result).toEqual(mockResponse)
  })

  test('correctly return state to onStateChange() for stalled requests', async () => {
    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest],
      stalledDelay: 20,
      onStateChange,
    })

    const result = await mockRequest()

    expect(onStateChange.mock.calls).toEqual([
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: true,
          isFinished: false,
          isStalled: false,
          timesRun: 1,
        },
      ],
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: true,
          isFinished: false,
          isStalled: true,
          timesRun: 1,
        },
      ],
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: false,
          isFinished: true,
          isStalled: false,
          timesRun: 1,
        },
      ],
    ])

    expect(result).toEqual(mockResponse)
  })

  test('correctly return state to onFetching(), onStalled() and onFinsihed() for stalled requests', async () => {
    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest],
      stalledDelay: 20,
      onFetching,
      onStalled,
      onFinished,
    })

    const result = await mockRequest()
    expect(onFetching).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: true,
      isFinished: false,
      isStalled: false,
      timesRun: 1,
    })
    expect(onStalled).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: true,
      isFinished: false,
      isStalled: true,
      timesRun: 1,
    })
    expect(onFinished).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: false,
      isFinished: true,
      isStalled: false,
      timesRun: 1,
    })

    expect(result).toEqual(mockResponse)
  })

  test('provide callback handlers at execution time', async () => {
    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest],
      stalledDelay: 20,
    })

    const result = await mockRequest({
      onFetching,
      onStalled,
      onFinished,
    })

    expect(onFetching).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: true,
      isFinished: false,
      isStalled: false,
      timesRun: 1,
    })
    expect(onStalled).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: true,
      isFinished: false,
      isStalled: true,
      timesRun: 1,
    })
    expect(onFinished).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: false,
      isFinished: true,
      isStalled: false,
      timesRun: 1,
    })

    expect(result).toEqual(mockResponse)
  })

  test('callback handlers at execution time should override previous handlers', async () => {
    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest],
      stalledDelay: 20,
      onFetching: jest.fn(),
      onFinished: jest.fn(),
    })

    const result = await mockRequest({
      onFetching,
      onStalled,
      onFinished,
    })

    expect(onFetching).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: true,
      isFinished: false,
      isStalled: false,
      timesRun: 1,
    })
    expect(onStalled).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: true,
      isFinished: false,
      isStalled: true,
      timesRun: 1,
    })
    expect(onFinished).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: false,
      isFinished: true,
      isStalled: false,
      timesRun: 1,
    })

    expect(result).toEqual(mockResponse)
  })

  test('explicit handlers should override onStateChange()', async () => {
    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest],
      stalledDelay: 20,
      onStateChange,
      onStalled,
    })

    const result = await mockRequest()
    expect(onFetching).not.toBeCalled()
    expect(onFinished).not.toBeCalled()
    expect(onStalled).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: true,
      isFinished: false,
      isStalled: true,
      timesRun: 1,
    })
    expect(onStateChange.mock.calls).toEqual([
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: true,
          isFinished: false,
          isStalled: false,
          timesRun: 1,
        },
      ],
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: false,
          isFinished: true,
          isStalled: false,
          timesRun: 1,
        },
      ],
    ])

    expect(result).toEqual(mockResponse)
  })

  test('correctly handle request errors', async () => {
    const failedRequest = createMockRequest({ time: 50, mockResponse, fail: true })

    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [failedRequest],
      stalledDelay: 20,
      onFetching: jest.fn(),
      onFinished: jest.fn(),
    })

    try {
      await mockRequest({
        onFetching,
        onStalled,
        onFinished,
      })
    } catch (error) {
      expect(onFetching).toBeCalledWith({
        id: 'MOCK_REQUEST',
        isFetching: true,
        isFinished: false,
        isStalled: false,
        timesRun: 1,
      })
      expect(onStalled).toBeCalledWith({
        id: 'MOCK_REQUEST',
        isFetching: true,
        isFinished: false,
        isStalled: true,
        timesRun: 1,
      })
      expect(onFinished).toBeCalledWith({
        id: 'MOCK_REQUEST',
        isFetching: false,
        isFinished: true,
        isStalled: false,
        timesRun: 1,
      })
      expect(error).toEqual(mockResponse)
    }
  })

  test('if stalledDelay is not provided, isStalled should never be invoked', async () => {
    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest],
      onFetching,
      onStalled,
      onFinished,
    })

    const result = await mockRequest()
    expect(onFetching).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: true,
      isFinished: false,
      isStalled: false,
      timesRun: 1,
    })
    expect(onStalled).not.toBeCalled()
    expect(onFinished).toBeCalledWith({
      id: 'MOCK_REQUEST',
      isFetching: false,
      isFinished: true,
      isStalled: false,
      timesRun: 1,
    })

    expect(result).toEqual(mockResponse)
  })

  test('request should not be fired until execution time', async () => {
    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest],
      stalledDelay: 5,
      onFetching,
      onStalled,
      onFinished,
    })

    expect(onFetching).not.toBeCalled()
    expect(onStalled).not.toBeCalled()
    expect(onFinished).not.toBeCalled()

    await mockRequest()

    expect(onFetching).toBeCalled()
    expect(onStalled).toBeCalled()
    expect(onFinished).toBeCalled()
  })

  test('event handlers should be correctly called for multiple request-state-wrapper calls', async () => {
    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest],
      stalledDelay: 5,
      onFetching,
      onStalled,
      onFinished,
    })

    expect(onFetching).not.toBeCalled()
    expect(onStalled).not.toBeCalled()
    expect(onFinished).not.toBeCalled()

    await mockRequest()

    expect(onFetching).toBeCalledTimes(1)
    expect(onStalled).toBeCalledTimes(1)
    expect(onFinished).toBeCalledTimes(1)

    await mockRequest()

    expect(onFetching).toBeCalledTimes(2)
    expect(onStalled).toBeCalledTimes(2)
    expect(onFinished).toBeCalledTimes(2)

    await mockRequest()

    expect(onFetching).toBeCalledTimes(3)
    expect(onStalled).toBeCalledTimes(3)
    expect(onFinished).toBeCalledTimes(3)
  })
})

describe('multiple requests should', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('correctly return state to onStateChange() for non-stalled requests', async () => {
    const callback = jest.fn()
    const mockResponse = { data: 'mock-response-data' }
    const mockAPIRequest1 = createMockRequest({ time: 50, mockResponse })
    const mockAPIRequest2 = createMockRequest({ time: 60, mockResponse })
    const mockAPIRequest3 = createMockRequest({ time: 40, mockResponse })

    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest1, mockAPIRequest2, mockAPIRequest3],
      stalledDelay: 70,
      onStateChange: callback,
    })

    const result = await mockRequest()

    expect(callback.mock.calls).toEqual([
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: true,
          isFinished: false,
          isStalled: false,
          timesRun: 1,
        },
      ],
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: false,
          isFinished: true,
          isStalled: false,
          timesRun: 1,
        },
      ],
    ])

    expect(result).toEqual([mockResponse, mockResponse, mockResponse])
  })

  test('correctly return state to onStateChange() for stalled requests', async () => {
    const callback = jest.fn()
    const mockResponse = { data: 'mock-response-data' }
    const mockAPIRequest1 = createMockRequest({ time: 50, mockResponse })
    const mockAPIRequest2 = createMockRequest({ time: 60, mockResponse })
    const mockAPIRequest3 = createMockRequest({ time: 40, mockResponse })

    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest1, mockAPIRequest2, mockAPIRequest3],
      stalledDelay: 25,
      onStateChange: callback,
    })

    const result = await mockRequest()

    expect(callback.mock.calls).toEqual([
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: true,
          isFinished: false,
          isStalled: false,
          timesRun: 1,
        },
      ],
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: true,
          isFinished: false,
          isStalled: true,
          timesRun: 1,
        },
      ],
      [
        {
          id: 'MOCK_REQUEST',
          isFetching: false,
          isFinished: true,
          isStalled: false,
          timesRun: 1,
        },
      ],
    ])

    expect(result).toEqual([mockResponse, mockResponse, mockResponse])
  })

  test('correctly handle request errors', async () => {
    const onFetching = jest.fn()
    const onStalled = jest.fn()
    const onFinished = jest.fn()
    const mockResponse = { data: 'mock-response-data' }
    const mockErrorResponse = { error: 'mock-response-data' }
    const mockAPIRequest1 = createMockRequest({
      time: 10,
      mockResponse: mockErrorResponse,
      fail: true,
    })
    const mockAPIRequest2 = createMockRequest({ time: 20, mockResponse })
    const mockAPIRequest3 = createMockRequest({ time: 50, mockResponse })

    const mockRequest = createRequest({
      id: 'MOCK_REQUEST',
      request: [mockAPIRequest1, mockAPIRequest2, mockAPIRequest3],
      stalledDelay: 50,
      onFetching,
      onStalled,
      onFinished,
    })

    try {
      await mockRequest()
    } catch (error) {
      expect(onFetching).toBeCalledWith({
        id: 'MOCK_REQUEST',
        isFetching: true,
        isFinished: false,
        isStalled: false,
        timesRun: 1,
      })
      expect(onStalled).not.toBeCalled()
      expect(onFinished).toBeCalledWith({
        id: 'MOCK_REQUEST',
        isFetching: false,
        isFinished: true,
        isStalled: false,
        timesRun: 1,
      })
      expect(error).toEqual(mockErrorResponse)
    }
  })
})
