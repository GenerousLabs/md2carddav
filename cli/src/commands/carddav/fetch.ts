import { Command, Flags } from "@oclif/core";
import {
  createAccount,
  createDAVClient,
  DAVNamespaceShort,
  fetchAddressBooks,
  syncCollection,
} from "tsdav";
import { getCache, setCache } from "../../services/cache/cache.service";

const serverUrl = process.env.URL as string;
const username = process.env.USER as string;
const password = process.env.TOKEN as string;

export default class CarddavFetch extends Command {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    url: Flags.string({
      char: "u",
      description: "CardDAV URL",
      // required: true,
    }),
  };

  static args = [];

  private async setup() {
    const cache = getCache();

    this.log("Got cache #xwONmh");
    this.debug(cache);

    const client = await createDAVClient({
      serverUrl,
      authMethod: "Basic",
      credentials: {
        username,
        password,
      },
    });

    this.log("Got client #bVoqc1");
    this.debug(client);

    if (
      typeof cache.account !== "undefined" &&
      typeof cache.addressBooks !== "undefined"
    ) {
      this.log("Got cached account and addressBooks #AGOahk");
      return {
        client,
        account: cache.account as Awaited<ReturnType<typeof createAccount>>,
        addressBooks: cache.addressBooks as Awaited<
          ReturnType<typeof fetchAddressBooks>
        >,
      };
    }

    // NOTE: This can take >40s to complete against a monica instance with ~4k
    // contacts, need to figure out how to cache the result.
    const account = await client.createAccount({
      account: {
        serverUrl,
        accountType: "carddav",
      },
    });

    this.log("Got account #ToupBB");
    this.debug(account);

    const addressBooks = await client.fetchAddressBooks({ account });

    this.log("Got address books #kzx54I");
    this.debug(addressBooks);

    setCache("account", account);
    setCache("addressBooks", addressBooks);

    return { client, account, addressBooks };
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CarddavFetch);

    const { client, account, addressBooks } = await this.setup();
    const [addressBook] = addressBooks;
    this.debug(addressBook);

    // const vcards = await client.fetchVCards({
    //   addressBook,
    // });

    // this.log("Got vcards #VHvQJe");
    // this.debug(vcards);
    // return;

    const firstRound = await client.syncCollection({
      url: addressBook.url,
      props: {
        [`${DAVNamespaceShort.DAV}:getetag`]: {},
        [`${DAVNamespaceShort.CARDDAV}:FN`]: {},
      },
      syncLevel: 1,
    });
    this.log("Got first step of sync #STdk7t");
    for (const row of firstRound) {
      this.debug(row.raw, row.props, row.href, row.status);
    }

    this.log("Running #qcKLqf", args, flags);
  }
}
