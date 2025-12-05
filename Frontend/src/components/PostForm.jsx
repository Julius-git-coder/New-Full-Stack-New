import { useState, useEffect } from "react";
import { Upload, X, FileText, Image } from "lucide-react";
import { postAPI } from "../services/postApi";

export default function PostForm({ onPostCreated, editingPost, onCancelEdit }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title || "",
        content: editingPost.content || "",
      });
      if (editingPost.file?.url) {
        setFilePreview(editingPost.file.url);
        const filename = editingPost.file.filename || "";
        const ext = filename.split(".").pop()?.toLowerCase();
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
          setFileType("image");
        } else {
          setFileType("document");
        }
      }
    } else {
      resetForm();
    }
  }, [editingPost]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      setFileType("image");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFileType("document");
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileType(null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
    });
    setFile(null);
    setFilePreview(null);
    setFileType(null);
  };

  const getFileIcon = (filename) => {
    if (!filename) return "📎";
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
    if (ext === "pdf") return "📄";
    return "📎";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert("Please fill in title and content");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);

      if (file) {
        submitData.append("file", file);
      }

      if (editingPost) {
        await postAPI.updatePost(editingPost._id, submitData);
        alert("Post updated successfully!");
      } else {
        await postAPI.createPost(submitData);
        alert("Post created successfully!");
      }

      resetForm();
      onPostCreated();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.response?.data?.error || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {editingPost ? "Edit Post" : "Create New Post"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {editingPost
            ? "Update post information below"
            : "Share announcements with users"}
        </p>
      </div>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter post title"
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachment (Optional)
            </label>

            {!filePreview && !file ? (
              <div
                className={`relative border-2 border-dashed rounded-md transition-colors ${
                  dragActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,.pdf"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-gray-100 p-3 mb-3">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Images: JPEG, PNG, GIF, WebP • Documents: PDF (max 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                <div className="flex items-center gap-4">
                  {fileType === "image" && filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-md border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-md">
                      <span className="text-3xl">
                        {getFileIcon(file?.name || editingPost?.file?.filename)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file?.name ||
                        editingPost?.file?.filename ||
                        "Existing file"}
                    </p>
                    {file && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          {editingPost && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Submitting..."
              : editingPost
              ? "Update Post"
              : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
}