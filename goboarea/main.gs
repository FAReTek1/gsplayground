%include std\\f3d.gs
costumes "blank.svg";
costumes "f3d/*.svg";

onflag {
    RESET_POS;
    cache_costume_dims;

    forever {
        goto_pos pos{
            x: 0, y:0, s: 100, d: 90
        };
        # f3d "Cat", 2 * mouse_x(), 0;
        if f3d("Cat", 2 * mouse_x(), 0) {
            show;
        } else {
            hide;
        }
    }
}
