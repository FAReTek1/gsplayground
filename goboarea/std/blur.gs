# Collection of different blur techniques.
# Credit will be provided

# Blur using fisheye effect
# Based on https://scratch.mit.edu/projects/918003300
proc radblur steps, fisheye, ghost {
    repeat $steps {
        # Instead of varying position, we can alter fisheye to create a radial blur instead
        change_fisheye_effect $fisheye / $steps;
        change_ghost_effect $ghost / $steps;
        stamp;
    }
    change_fisheye_effect -$fisheye;
    change_ghost_effect -$ghost;
}
