%include std\\color.gs

costumes "blank.svg";

onflag {
    hide;

    set_size "Infinity";
    forever {
        erase_all;
        pointengine_tick;

    }
}