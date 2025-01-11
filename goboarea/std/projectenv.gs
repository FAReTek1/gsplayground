# Miscellaneous utilites
# This module will break if you reset the timer!
# It will also broadcast a loop broadcast every single frame!
# (for now, ignore this) NOTE: Including this module will cause your project to become unstoppable! (This probably won't affect your code)

# Macro to be used with timer > boolean to create a when <bool> hat
%define TBOOL(b) 0.0000000000001 / b # yeah, silly code ik, but it works

onflag {
    # Is it ideal if this resets on green flag? Probably
    stop_count = 0;
    pause_count = 0;

    tick_number = 0;
    _utils_pt = 0;
    _utils_pdays_since_2000 = days_since_2000();
}

# To manage the stuff, call this procedure every frame
proc utils_loop {
    tick_number ++;

    # delta2000 = days_since_2000() - _utils_pdays_since_2000;
    _utils_pdays_since_2000 = days_since_2000();

    delta = timer() - _utils_pt;
    _utils_pt = timer();

    fps = 1 / delta;
    fpsmul = 30 * delta;
}

# This **SHOULD** work, but goboscript doesn't seem to have proper support for the other hat blocks.
ontimer > TBOOL(days_since_2000() - _utils_pdays_since_2000 > 0.0000015) {
    # This code is not very exact. It actually just detects for a certain amount of lag spike via the days since 2000 reporter.
    pause_count ++;
    broadcast "utils_unpaused";
}

ontimer > _utils_pt + 1.0 / 30.0 {
    broadcast "_utils_loop";
    stop_count ++;
    broadcast "utils_stopped";
}

# - demo code -
# costumes "blank.svg";
