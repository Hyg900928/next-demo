module.exports = {
    apps : [{
        name   : "next-demo",
        script: "node_modules/next/dist/bin/next",
        env: {
            NODE_ENV: "production",
            PORT: 3000,
        },
        args: "start",
    }]
}
