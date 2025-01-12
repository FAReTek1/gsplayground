# Collection of procedures which use the fisheye/whirl effects to warp the image of a sprite

proc jiggle amt {
    # Set whirl effect and turn right by the same amount
    set_whirl_effect $amt;
    turn_right $amt;
}

# Based on jiggle effect from @infinitto_sub
# Probably only works with the specific invisible box from @infinitto_sub
# https://scratch.mit.edu/projects/1016596980/
proc looping_jiggle amt {
    if $amt == $amt % 180 {
        if $amt > 90 {
            set_whirl_effect $amt - 180;
            turn_right $amt * 0.8888888888888888 - 160;
        } else {
            jiggle $amt;
        }
    } else {
        # Tail recursion is ok, and this can only happen once
        looping_jiggle $amt % 180;
    }
}
