import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { makeStore } from "@/lib/store/store";

import { libraryLoaded } from "../librarySlice";
import { FavoriteButton } from "./FavoriteButton";

const renderButton = () => {
  const store = makeStore();
  render(
    <Provider store={store}>
      <FavoriteButton slug="metal-slug-x" title="Metal Slug X" />
    </Provider>,
  );
  return store;
};

describe("FavoriteButton", () => {
  it("is disabled until the library has loaded", () => {
    renderButton();
    expect(
      screen.getByRole("button", { name: "Add Metal Slug X to favorites" }),
    ).toBeDisabled();
  });

  it("toggles the favorite in the store", async () => {
    const store = renderButton();
    act(() => {
      store.dispatch(libraryLoaded({ favorites: [], recent: [] }));
    });

    const button = await screen.findByRole("button", {
      name: "Add Metal Slug X to favorites",
    });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(button);

    expect(store.getState().library.favorites).toEqual(["metal-slug-x"]);
    expect(
      screen.getByRole("button", {
        name: "Remove Metal Slug X from favorites",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
