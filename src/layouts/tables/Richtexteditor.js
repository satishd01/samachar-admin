import React from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { styled } from "@mui/material/styles";

const StyledReactQuill = styled(ReactQuill)(({ theme }) => ({
  "& .ql-container": {
    minHeight: "150px",
    fontSize: "16px",
    fontFamily: theme?.typography?.fontFamily || "inherit",
  },
  "& .ql-toolbar": {
    borderTopLeftRadius: theme?.shape?.borderRadius || "4px",
    borderTopRightRadius: theme?.shape?.borderRadius || "4px",
    borderBottom: "none",
  },
  "& .ql-container.ql-snow": {
    borderBottomLeftRadius: theme?.shape?.borderRadius || "4px",
    borderBottomRightRadius: theme?.shape?.borderRadius || "4px",
  },
}));

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <StyledReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder={placeholder || "Enter your message..."}
    />
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

RichTextEditor.defaultProps = {
  value: "",
  placeholder: "",
};

export default RichTextEditor;
