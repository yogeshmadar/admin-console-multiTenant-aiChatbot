import { Backdrop, CircularProgress, Grid, TextField } from "@mui/material";
import React, { useState } from "react";
import { ColorPicker, IColor, useColor } from "react-color-palette";

interface ColorPickerInpuProps {
  initial: string;
  onChange: (e: string) => void;
}

const ColorPickerInput = ({ initial, onChange }: ColorPickerInpuProps) => {
  const [color, setColor] = useColor(initial || '#121212');
  const [open, setOpen] = useState(false);

  const handleChange = (e: IColor) => {
    setColor(e);
    onChange(e.hex);
  };

  return (
    <div style={{ position: "relative" }}>
      <TextField
        fullWidth
        name="Theme_Color"
        id="Theme Color"
        type="text"
        placeholder="Theme Color"
        size="small"
        variant="standard"
        value={color.hex}
        // error={!!errors.Theme_Color}
        // helperText={errors.Theme_Color}
        // onChange={handleChange}
        // onBlur={handleBlur}
        onFocus={() => setOpen(true)}
        InputProps={{ sx: { maxLength: 51 } }}
      />
      <div
        style={{
          position: "absolute",
          display: open ? "block" : "none",
          zIndex: 1000,
        }}
      >
        <ColorPicker
          color={color}
          onChange={handleChange}
          hideInput={["rgb", "hsv"]}
          height={100}
        />
      </div>
      <Backdrop
        style={{ opacity: 0 }}
        open={open}
        onClick={() => setOpen(false)}
      ></Backdrop>
    </div>
  );
};

export default ColorPickerInput;
