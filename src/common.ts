
export const error = function(name: string, message: string) {
    let err = new Error(message);
    err.name = name;
    return;
}
