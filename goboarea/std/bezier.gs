# Module dealing with all your bezier stuffies
# costumes "blank.svg";

%include std\\geo2d.gs

# --- Structs ---
struct CubBezier {
    x1, y1,
    x2, y2,
    x3, y3,
    x4, y4
}

# --- Cubic Bezier ---
proc draw_cubbez CubBezier bez, res {
    # https://scratch.mit.edu/projects/914063296/ with some changes
    local _1 = ($bez.x4 - (3 * ($bez.x3 - $bez.x2))) - $bez.x1;
    local _2 = 3 * ($bez.x1 + ($bez.x3 - $bez.x2 * 2));
    local _3 = 3 * ($bez.x2 - $bez.x1);
    local _4 = ($bez.y4 - (3 * ($bez.y3 - $bez.y2))) - $bez.y1;
    local _5 = 3 * ($bez.y1 + ($bez.y3 - $bez.y2 * 2));
    local _6 = 3 * ($bez.y2 - $bez.y1);

    local t = 0;
    repeat $res {
        goto $bez.x1 + t * (_3 + t * (_2 + t * _1)),
             $bez.y1 + t * (_6 + t * (_5 + t * _4));
        pen_down;
        t += 1 / $res;
    }
    pen_up;
}

# onflag {
#     forever {
#         erase_all;
#         draw_cubbez CubBezier{
#             x1: 0, y1: 0,
#             x2: mouse_x(), y2: mouse_y(),
#             x3: 100, y3: 0,
#             x4: 0, y4: 100
#         }, 20;
#     }
# }
