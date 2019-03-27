import { createRequest } from './index'

const createMockRequest = ({ time, mockResponse, fail = false }) =>
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
      request: [mockAPIRequest],
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
})

describe('multiple requests should', () => {
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
})
