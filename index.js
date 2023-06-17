// LICENSE : MIT
"use strict";
console.log("NODE_ENV: " + process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
    require("@babel/register");
    // Start Node -> Browser
    require("./src/main/index");
} else {
    require("./lib/main/index");
}
