import { useState } from "react";
import { RefreshCw, Download, Edit2, Trash2, FileText } from "lucide-react";

const mockUsers = [
  {
    _id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    file: {
      url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      filename: "profile-photo.jpg",
    },
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    file: {
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      filename: "resume.pdf",
    },
  },
  {
    _id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    phone: "+1 (555) 456-7890",
    address: "789 Pine Rd, Chicago, IL 60601",
    file: null,
  },
  {
    _id: "4",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "+1 (555) 234-5678",
    address: "321 Elm St, Houston, TX 77001",
    file: {
      url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      filename: "document.txt",
    },
  },
];

export default function UserList() {
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  };

  const handleEdit = (user) => {
    alert(
      `Edit user: ${user.name}\n\nIn a real app, this would open an edit form.`
    );
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user._id !== userId));
      alert("User deleted successfully!");
    }
  };

  const handleDownload = (userId, filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    const imageFormats = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];

    if (imageFormats.includes(ext) || ext === "pdf") {
      alert(
        `Opening ${filename} in new tab...\n\nIn a real app, this would display the file.`
      );
    } else if (ext === "txt") {
      alert(
        `Viewing ${filename}...\n\nIn a real app, this would show the text content.`
      );
    } else {
      alert(
        `Downloading ${filename}...\n\nIn a real app, this would download the file.`
      );
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return <FileText className="w-3 h-3" />;
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "🖼️";
    if (ext === "pdf") return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (ext === "txt") return "📃";
    return "📎";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Users List
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {users.length} {users.length === 1 ? "user" : "users"} total
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <div className="px-8 py-6">
            {loading && users.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-4">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  No users found
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Create your first user to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {user.file?.url && (
                            <img
                              src={user.file.url}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {(user.phone || user.address) && (
                          <div className="ml-15 space-y-1">
                            {user.phone && (
                              <p className="text-sm text-gray-600">
                                📞 {user.phone}
                              </p>
                            )}
                            {user.address && (
                              <p className="text-sm text-gray-600 truncate">
                                📍 {user.address}
                              </p>
                            )}
                          </div>
                        )}

                        {user.file && (
                          <div className="mt-2 ml-15">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                              <span className="text-base">
                                {getFileIcon(user.file.filename)}
                              </span>
                              {user.file.filename || "File attached"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {user.file && (
                          <button
                            onClick={() =>
                              handleDownload(user._id, user.file.filename)
                            }
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                            <Download className="w-4 h-4" />
                            {[
                              "jpg",
                              "jpeg",
                              "png",
                              "gif",
                              "webp",
                              "bmp",
                              "pdf",
                              "txt",
                            ].includes(
                              user.file.filename
                                ?.split(".")
                                .pop()
                                ?.toLowerCase()
                            )
                              ? "View"
                              : "Download"}
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(user)}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
