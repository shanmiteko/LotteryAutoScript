/**
 * @param {Array<number>} nums
 * @param {Array<()=>any>} fns
 */
function par_run(nums, fns) {
    return Promise.all(
        nums.map(num => fns[num]())
    );
}

module.exports = {
    par_run
};