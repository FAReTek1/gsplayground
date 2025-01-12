%include std\\f3d.gs
costumes "blank.svg";
costumes "f3d/*.svg";

onflag {
    RESET_POS;
    cache_costume_dims;
    dp = 20;
    hide;

    forever {
        erase_all;
        if mouse_down(){
            rx = "";
            ry = timer() * 90;
        } else {
            rx = timer() * 90;
            ry = "";
        }

        set_brightness_effect -100;
        f3d_prism pos{
            x: 0, y: 0, s: 100, d: 90
        }, "Cat", rx, ry, 15, abs(dp);

        RESET_POS;
        clear_graphic_effects;
        if check_draw_at_rot(rx + ry) {if f3d("Cat", rx, ry){stamp;}}
    }
}

onkey "up arrow" {
    if not key_pressed("up arrow") {
        dp += 5;
    }
}

onkey "down arrow" {
    if not key_pressed("down arrow") {
        dp -= 5;
    }
}