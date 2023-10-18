import { useState, ChangeEvent, FormEvent } from "react";
import { Inter } from "next/font/google";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

interface iCat {
  id: number;
  name: string;
  breed: string;
  color: string;
  owner: string;
  address: string;
  stray: boolean;
}

interface iHomeProps {
  cats: iCat[];
}

const Home: React.FC<iHomeProps> = ({ cats }) => {
  const [search, setSearch] = useState<string>("");
  const [catList, setCatList] = useState<iCat[] | []>(cats);
  const [deleteCats, setDeleteCats] = useState<iCat[] | []>([]);
  const [addCat, setAddCat] = useState({
    name: "",
    breed: "",
    color: "",
    address: "",
    owner: "",
    stray: false,
  });
  const [editCat, setEditCat] = useState({
    name: "",
    breed: "",
    color: "",
    address: "",
    owner: "",
    stray: false,
  });

  const clearDisable = search.length > 0;
  const deleteDisable = deleteCats.length > 0;

  const getCats = async () => {
    const response = await axios.get(process.env.NEXT_PUBLIC_CAT_API!);
    setCatList(response.data.cats);
  };

  const searchCat = async (catQuery: string) => {
    const url = `${process.env.NEXT_PUBLIC_CAT_API!}?name=${search}`;
    const response = await axios.get(url);
    setCatList(response.data.cats);
  };

  const handleNewCat = (e: ChangeEvent<HTMLInputElement>, property: string) => {
    let newValue = e.target.value;
    setAddCat((prevData) => ({
      ...prevData,
      [property]: newValue,
    }));
  };

  const handleNewCatBool = (
    e: ChangeEvent<HTMLSelectElement>,
    property: string
  ) => {
    let newValue: string | boolean = e.target.value;
    console.log(typeof e.target.value);
    if (newValue === "true") {
      newValue = true;
    } else {
      newValue = false;
    }
    setAddCat((prevData) => ({
      ...prevData,
      [property]: newValue,
    }));
  };

  const postCat = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_CAT_API!,
        addCat
      );
      if (response.status === 200) {
        await getCats();
        if (document) {
          (document.getElementById("add_new") as HTMLFormElement).close();
        }
      } else {
        console.error("Failed to create a new item:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
      throw error; // Propagate the error to the calling code
    }
  };

  const handleEditCat = (
    e: ChangeEvent<HTMLInputElement>,
    property: string
  ) => {
    let newValue = e.target.value;
    setEditCat((prevData) => ({
      ...prevData,
      [property]: newValue,
    }));
  };

  const handleEditCatBool = (
    e: ChangeEvent<HTMLSelectElement>,
    property: string
  ) => {
    let newValue: string | boolean = e.target.value;
    if (newValue === "true") {
      newValue = true;
    } else {
      newValue = false;
    }
    setEditCat((prevData) => ({
      ...prevData,
      [property]: newValue,
    }));
  };

  const putCat = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        process.env.NEXT_PUBLIC_CAT_API!,
        editCat
      );
      if (response.status === 200) {
        await getCats();
        if (document) {
          (document.getElementById("edit") as HTMLFormElement).close();
        }
      } else {
        console.error("Failed to update a item:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
      throw error; // Propagate the error to the calling code
    }
  };

  const handleDeleteList = (cat: iCat) => {
    const inList = deleteCats.some((cats) => cats.id === cat.id);
    if (inList) {
      const removedCat = deleteCats.filter((cats) => cats.id !== cat.id);
      setDeleteCats(removedCat);
    } else {
      setDeleteCats([...deleteCats, cat]);
    }
  };

  const deleteSelectedCats = async () => {
    try {
      const response = await axios.delete(process.env.NEXT_PUBLIC_CAT_API!, {
        data: { toBeDeleted: deleteCats }, // Send the array of cats in the request body
      });
      if (response.status === 200) {
        await getCats();
        if (document) {
          (document.getElementById("edit") as HTMLFormElement).close();
        }
      } else {
        console.error("Failed to delete a item:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
      throw error; // Propagate the error to the calling code
    }
  };

  return (
    <main
      className={`flex justify-center min-h-screen m-3  ${inter.className}`}
    >
      <div className="w-[60%]">
        <h1 className="pt-6 text-3xl">Cat Tracker</h1>
        <div id="search-bar" className="flex justify-between py-12 ml-auto">
          <button
            className="btn btn-primary"
            onClick={() => {
              if (document) {
                (
                  document.getElementById("add_new") as HTMLFormElement
                ).showModal();
              }
            }}
          >
            Add New
          </button>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type here"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full max-w-xl"
            />
            <button
              className="btn btn-primary"
              disabled={!clearDisable}
              onClick={() => searchCat(search)}
            >
              SEARCH
            </button>
            <button
              className="btn"
              disabled={!clearDisable}
              onClick={() => {
                setSearch("");
                getCats();
              }}
            >
              clear
            </button>
          </div>
        </div>
        <div id="data-table">
          <div className="overflow-x-auto border-2 border-black rounded-xl">
            <table className="table table-zebra ">
              {/* head */}
              <thead>
                <tr className="hover">
                  <th></th>
                  <th>id</th>
                  <th>Name</th>
                  <th>Breed</th>
                  <th>Color</th>
                  <th>Owner</th>
                  <th>Address</th>
                  <th>Stray</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {catList.map((cat) => (
                  <tr className="hover" key={cat.id}>
                    <td>
                      <label>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={deleteCats.some(
                            (cats) => cats.id === cat.id
                          )}
                          onChange={() => handleDeleteList(cat)}
                        />
                      </label>
                    </td>
                    <td>{cat.id}</td>
                    <td>{cat.name}</td>
                    <td>{cat.breed}</td>
                    <td>{cat.color}</td>
                    <td>{cat.owner}</td>
                    <td>{cat.address}</td>
                    <td>{cat.stray.toString()}</td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        onClick={() => {
                          if (document) {
                            (
                              document.getElementById("edit") as HTMLFormElement
                            ).showModal();
                          }
                          setEditCat(cat);
                        }}
                      >
                        edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex">
            <p className="mt-3">Cat Watchers LLC 2023</p>
            <button
              className="btn mt-3 ml-auto"
              disabled={!deleteDisable}
              onClick={deleteSelectedCats}
            >
              delete
            </button>
          </div>
        </div>
      </div>
      <dialog id="add_new" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-5">Add New Cat</h3>
          <form onSubmit={postCat}>
            <input
              type="text"
              placeholder="Enter Name here..."
              className="input input-bordered w-full max-w-xl mb-3"
              onChange={(e) => handleNewCat(e, "name")}
            />
            <input
              type="text"
              placeholder="Enter Breed here..."
              className="input input-bordered w-full max-w-xl mb-3"
              onChange={(e) => handleNewCat(e, "breed")}
            />
            <input
              type="text"
              placeholder="Enter Color here..."
              className="input input-bordered w-full max-w-xl mb-3"
              onChange={(e) => handleNewCat(e, "color")}
            />
            <input
              type="text"
              placeholder="Enter Owner here..."
              className="input input-bordered w-full max-w-xl mb-3"
              onChange={(e) => handleNewCat(e, "owner")}
            />
            <input
              type="text"
              placeholder="Enter Address here..."
              className="input input-bordered w-full max-w-xl mb-3"
              onChange={(e) => handleNewCat(e, "address")}
            />
            <select
              className="select input-bordered w-full max-w-xl"
              onChange={(e) => handleNewCatBool(e, "stray")}
              value={addCat.address} // Bind it to the value in your state
            >
              <option disabled value="" hidden>
                Is this cat a stray?
              </option>
              <option value={"true"}>Yes</option>
              <option value={"false"}>No</option>
            </select>
            <div className="modal-action">
              <button className="btn btn-primary" type="submit">
                submit
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  if (document) {
                    (
                      document.getElementById("add_new") as HTMLFormElement
                    ).close();
                  }
                }}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </dialog>
      <dialog id="edit" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-5">Edit Cat</h3>
          <form onSubmit={putCat}>
            <input
              type="text"
              placeholder="Edit Name here..."
              className="input input-bordered w-full max-w-xl mb-3"
              value={editCat.name}
              onChange={(e) => handleEditCat(e, "name")}
            />
            <input
              type="text"
              placeholder="Edit Breed here..."
              className="input input-bordered w-full max-w-xl mb-3"
              value={editCat.breed}
              onChange={(e) => handleEditCat(e, "breed")}
            />
            <input
              type="text"
              placeholder="Edit Color here..."
              className="input input-bordered w-full max-w-xl mb-3"
              value={editCat.color}
              onChange={(e) => handleEditCat(e, "color")}
            />
            <input
              type="text"
              placeholder="Edit Owner here..."
              className="input input-bordered w-full max-w-xl mb-3"
              value={editCat.owner}
              onChange={(e) => handleEditCat(e, "owner")}
            />
            <input
              type="text"
              placeholder="Edit Address here..."
              className="input input-bordered w-full max-w-xl mb-3"
              value={editCat.address}
              onChange={(e) => handleEditCat(e, "address")}
            />
            <select
              className="select input-bordered w-full max-w-xl"
              value={editCat.stray.toString()} // Bind it to the value in your state
              onChange={(e) => handleEditCatBool(e, "stray")}
            >
              <option disabled value="" hidden>
                Is this cat a stray?
              </option>
              <option value={"true"}>Yes</option>
              <option value={"false"}>No</option>
            </select>
            <div className="modal-action">
              <button className="btn btn-primary" type="submit">
                submit
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  if (document) {
                    (
                      document.getElementById("edit") as HTMLFormElement
                    ).close();
                  }
                }}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </main>
  );
};

export default Home;

export const getServerSideProps = async () => {
  const api = process.env.NEXT_PUBLIC_CAT_API;
  const response = await axios.get(api!);
  const data = response.data.cats;
  return {
    props: {
      cats: data,
    },
  };
};
