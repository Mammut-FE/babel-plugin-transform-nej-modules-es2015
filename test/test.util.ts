export function expectCodeEqual(result: string, expected: string) {
    result = result.split('\n').map(line => line.trim()).filter(line => line).join('\n');
    expected = expected.split('\n').map(line => line.trim()).filter(line => line).join('\n');

    expect(result).toEqual(expected);
}
