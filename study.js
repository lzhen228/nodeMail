const  add = (...args) => {
    return args.reduce(function(sum ,val){
         return sum + val
    },0)
}