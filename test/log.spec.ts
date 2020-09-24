import { init } from '../src/log'

test('Test logger init function.', () => {
    init('log')
    console.log('log')
})