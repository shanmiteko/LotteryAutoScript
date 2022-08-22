/**
 * @param {Array<()=>any>} fns
 */
function par_run(fns) {
    return Promise.all((fns.map(fn => fn())))
}

module.exports = {
    par_run
}