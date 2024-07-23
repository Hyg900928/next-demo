module.exports = {
    apps : [{
        name   : "next-demo",
        script: "node_modules/next/dist/bin/next",
        env: {
            NODE_ENV: "production",
            PORT: 3000,
        },
        args: "start",
        // out_file: "/www/wwwlogs/next_demo.log",
        // error_file: "/www/wwwlogs/next_demo.error.log",
        merge_logs: true,
        log_date_format: "YYYY-MM-DD HH:mm:ss",
        cwd: "./",
        max_memory_restart: "1G",
    }]
}
